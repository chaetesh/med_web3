import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { MedicalRecordsService } from './medical-records.service';
import { AccessLogsService } from '../access-logs/access-logs.service';
import type { Response } from 'express';
import type { Multer } from 'multer';
import { RecordType } from './schemas/medical-record.schema';
import { UserRole } from '../users/schemas/user.schema';

// DTOs
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  IsObject,
  IsISO8601,
  ValidateIf,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateRecordDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'Record type is required' })
  @IsEnum(RecordType, { message: 'Invalid record type' })
  recordType: RecordType;

  @IsOptional()
  @IsISO8601()
  recordDate?: Date;

  @IsOptional()
  @IsString()
  hospitalId?: string;

  @ValidateIf((o) => o.patientId !== undefined)
  @IsString()
  patientId: string;

  @IsNotEmpty({ message: 'Patient address is required' })
  @IsString()
  patientAddress: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

class ShareRecordDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  userToShareWithId: string;

  @IsNotEmpty({ message: 'Blockchain address is required' })
  @IsString({ message: 'Blockchain address must be a string' })
  userToShareWithAddress: string;

  @IsNotEmpty({ message: 'Expiration time is required' })
  @Type(() => Number)
  expirationTime: number; // Unix timestamp in seconds (not milliseconds)
}

class RevokeAccessDto {
  @IsNotEmpty()
  @IsString()
  userToRevokeId: string;

  @IsNotEmpty()
  @IsString()
  userToRevokeAddress: string;
}

@Controller('medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly accessLogsService: AccessLogsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  )
  async create(
    @Request() req,
    @Body() createRecordDto: CreateRecordDto,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Explicitly check required fields (they should already be validated by ValidationPipe)
    if (!createRecordDto.title) {
      throw new BadRequestException('Title is required');
    }

    if (!createRecordDto.recordType) {
      throw new BadRequestException('Record type is required');
    }

    let patientId: string;

    // If current user is a patient, they can only create records for themselves
    if (req.user.role === UserRole.PATIENT) {
      patientId = req.user.id;

      // Override any patientId in the DTO with the user's own ID
      createRecordDto.patientId = patientId;
    } else {
      // For doctors, hospital admins, etc.
      if (!createRecordDto.patientId) {
        throw new BadRequestException(
          'Patient ID is required for non-patient users',
        );
      }
      patientId = createRecordDto.patientId;
    }

    return this.medicalRecordsService.create(
      patientId,
      createRecordDto.patientAddress,
      {
        title: createRecordDto.title,
        description: createRecordDto.description,
        recordType: createRecordDto.recordType,
        // recordDate is no longer passed here - will be auto-generated in service
        hospitalId: createRecordDto.hospitalId || req.user.hospitalId,
        metadata: createRecordDto.metadata,
      },
      file.buffer,
      req.user.id, // doctorId is now the 5th parameter
      req.user.hospitalId, // hospitalId
      file.originalname, // original file name
      file.mimetype, // mime type
    );
  }

  @Get()
  async findAll(@Request() req) {
    switch (req.user.role) {
      case UserRole.PATIENT:
        // Patients can only see their own records
        return this.medicalRecordsService.findAllByPatient(req.user.id);
      case UserRole.DOCTOR:
        // Doctors can see records shared with them
        return this.medicalRecordsService.findAllSharedWithDoctor(req.user.id);
      case UserRole.HOSPITAL_ADMIN:
      case UserRole.SYSTEM_ADMIN:
        // Admins can see records by hospital or all records
        if (req.query.patientId) {
          return this.medicalRecordsService.findAllByPatient(
            req.query.patientId,
          );
        }
        break;
    }

    throw new BadRequestException(
      'Invalid request. Specify parameters based on your role.',
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.medicalRecordsService.findById(
      id,
      req.user.id,
      req.user.walletAddress,
      req.query.patientAddress,
    );
  }

  @Get(':id/file')
  async getFile(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const result = await this.medicalRecordsService.getRecordFileWithMetadata(
      id,
      req.user.id,
      req.user.walletAddress,
      req.query.patientAddress,
    );

    // Get sanitized filename (remove potential path traversal characters)
    const safeFilename = result.filename.replace(/[^\w\s.-]/g, '_');

    // Send file as download with original file type and name
    res.set({
      'Content-Type': result.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
    });

    res.send(result.fileBuffer);
  }

  @Post(':id/share')
  async shareRecord(
    @Request() req,
    @Param('id') id: string,
    @Body() shareRecordDto: ShareRecordDto,
  ) {
    // Only patients can share their own records
    if (req.user.role !== UserRole.PATIENT) {
      throw new BadRequestException('Only patients can share their records');
    }

    // Validate expiration time is in the future (at least 1 minute)
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const minExpirationTime = currentTime + 60; // At least 1 minute in the future

    if (shareRecordDto.expirationTime <= currentTime) {
      throw new BadRequestException('Expiration time must be in the future');
    }

    if (shareRecordDto.expirationTime < minExpirationTime) {
      throw new BadRequestException(
        'Expiration time must be at least 1 minute in the future',
      );
    }

    return this.medicalRecordsService.shareRecord(
      id,
      shareRecordDto.userToShareWithId,
      shareRecordDto.userToShareWithAddress,
      shareRecordDto.expirationTime,
    );
  }

  @Post(':id/revoke')
  async revokeAccess(
    @Request() req,
    @Param('id') id: string,
    @Body() revokeAccessDto: RevokeAccessDto,
  ) {
    // Only patients can revoke access to their own records
    if (req.user.role !== UserRole.PATIENT) {
      throw new BadRequestException(
        'Only patients can revoke access to their records',
      );
    }

    return this.medicalRecordsService.revokeAccess(
      id,
      req.user.id,
      req.user.walletAddress,
      revokeAccessDto.userToRevokeId,
      revokeAccessDto.userToRevokeAddress,
    );
  }

  @Post(':id/verify')
  async verifyRecord(@Param('id') id: string) {
    return this.medicalRecordsService.verifyRecord(id);
  }

  @Post(':id/retry-blockchain')
  async retryBlockchainStorage(@Param('id') id: string, @Request() req) {
    // Only system admins can retry blockchain storage
    if (req.user.role !== UserRole.SYSTEM_ADMIN) {
      throw new BadRequestException(
        'Only system administrators can retry blockchain storage',
      );
    }

    return this.medicalRecordsService.retryBlockchainStorage(id);
  }
}
