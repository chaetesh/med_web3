import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { SystemAdminService } from './system-admin.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalStatusDto } from './dto/update-hospital-status.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class SystemAdminController {
  constructor(private readonly systemAdminService: SystemAdminService) {}

  @Get('overview')
  async getSystemOverview() {
    return this.systemAdminService.getSystemOverview();
  }

  @Get('hospitals')
  async getAllHospitals(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.systemAdminService.getAllHospitals({
      page,
      limit,
      status,
    });
  }

  @Post('hospitals')
  async createHospital(@Body() createHospitalDto: CreateHospitalDto) {
    try {
      return await this.systemAdminService.registerHospital(createHospitalDto);
    } catch (error) {
      // Let the exception filter handle it
      throw error;
    }
  }

  @Put('hospitals/:id/status')
  async updateHospitalStatus(
    @Param('id') hospitalId: string,
    @Body() updateStatusDto: UpdateHospitalStatusDto,
  ) {
    return this.systemAdminService.updateHospitalStatus(hospitalId, updateStatusDto);
  }

  @Get('hospitals/:id')
  async getHospitalDetails(@Param('id') hospitalId: string) {
    // This would be implemented in hospitals service
    // For now, we'll use a placeholder
    return { message: 'Hospital details endpoint' };
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') searchTerm?: string,
  ) {
    return this.systemAdminService.getAllUsers({
      page,
      limit,
      role,
      searchTerm,
    });
  }

  @Get('blockchain/status')
  async getBlockchainStatus() {
    return this.systemAdminService.getBlockchainStatus();
  }

  @Get('audit-logs')
  async getSystemAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.systemAdminService.getSystemAuditLogs({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      type,
      userId,
      page,
      limit,
    });
  }
}
