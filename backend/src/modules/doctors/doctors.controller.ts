import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('profile')
  @Roles(UserRole.DOCTOR)
  async getDoctorProfile(@Request() req) {
    return this.doctorsService.getDoctorProfile(req.user.id);
  }

  @Put('profile')
  @Roles(UserRole.DOCTOR)
  async updateDoctorProfile(@Request() req, @Body() updateData: any) {
    return this.doctorsService.updateDoctorProfile(req.user.id, updateData);
  }

  @Get('patients')
  @Roles(UserRole.DOCTOR)
  async getDoctorPatients(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.doctorsService.getDoctorPatients(req.user.id, { page, limit });
  }

  @Get('patients/:patientId')
  @Roles(UserRole.DOCTOR)
  async getPatientDetails(
    @Request() req,
    @Param('patientId') patientId: string,
  ) {
    return this.doctorsService.getPatientDetails(patientId, req.user.id);
  }
}
