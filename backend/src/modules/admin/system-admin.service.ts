import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalStatusDto, HospitalStatus } from './dto/update-hospital-status.dto';
import { UserRole } from '../users/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SystemAdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hospitalsService: HospitalsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async getSystemOverview() {
    // Count users by role
    const patientCount = await this.usersService.countByRole(UserRole.PATIENT);
    const doctorCount = await this.usersService.countByRole(UserRole.DOCTOR);
    const hospitalAdminCount = await this.usersService.countByRole(UserRole.HOSPITAL_ADMIN);
    
    // Get blockchain status
    const blockchainStatus = await this.blockchainService.getStatus();
    
    // Placeholder implementation for metrics that would require aggregation
    return {
      users: {
        total: patientCount + doctorCount + hospitalAdminCount + 1, // +1 for system admin
        patients: patientCount,
        doctors: doctorCount,
        hospitalAdmins: hospitalAdminCount,
      },
      blockchain: blockchainStatus,
      records: {
        total: 0,
        verified: 0,
        pending: 0,
      },
      hospitals: {
        total: 0,
        active: 0,
        pending: 0,
      },
      systemHealth: {
        status: 'healthy',
        uptime: process.uptime(),
        lastBackup: new Date().toISOString(),
      },
    };
  }

  async registerHospital(createHospitalDto: CreateHospitalDto) {
    // Create hospital record
    const hospitalData = {
      name: createHospitalDto.name,
      address: createHospitalDto.address,
      city: createHospitalDto.city,
      state: createHospitalDto.state,
      country: createHospitalDto.country || 'United States',
      zipCode: createHospitalDto.zip,
      phone: createHospitalDto.phone,
      email: createHospitalDto.email,
      licenseNumber: createHospitalDto.registrationNumber,
      isActive: false, // Pending approval
      // Add other fields as needed
    };
    
    // This would be implemented in the hospitals service
    const hospital = await this.hospitalsService.create(hospitalData);
    
    // Create admin account
    const temporaryPassword = Math.random().toString(36).slice(-10);
    
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    const adminAccount = await this.usersService.create({
      email: createHospitalDto.adminDetails.email,
      firstName: createHospitalDto.adminDetails.firstName,
      lastName: createHospitalDto.adminDetails.lastName,
      password: hashedPassword,
      role: UserRole.HOSPITAL_ADMIN,
      hospitalId: hospital.id,
      isActive: false, // Pending approval
    });
    
    return {
      message: 'Hospital registered successfully',
      hospitalId: hospital.id,
      adminAccount: {
        userId: adminAccount.id,
        email: adminAccount.email,
        temporaryPassword,
      },
      status: 'pending',
    };
  }

  async updateHospitalStatus(hospitalId: string, updateStatusDto: UpdateHospitalStatusDto) {
    // This would be implemented in the hospitals service
    const hospital = await this.hospitalsService.updateStatus(
      hospitalId,
      updateStatusDto.status,
      updateStatusDto.notes,
    );
    
    // If approved, activate hospital and admin accounts
    if (updateStatusDto.status === HospitalStatus.APPROVED) {
      // Activate the hospital
      hospital.isActive = true;
      await hospital.save();
      
      // Find and activate the hospital admin
      const admin = await this.usersService.findHospitalAdmin(hospitalId);
      if (admin) {
        admin.isActive = true;
        await admin.save();
      }
    }
    
    return {
      message: 'Hospital status updated successfully',
      hospitalId,
      status: updateStatusDto.status,
    };
  }

  async getAllHospitals(options: { page?: number; limit?: number; status?: string }) {
    // This would be implemented in the hospitals service
    return this.hospitalsService.findAll(options);
  }

  async getAllUsers(options: { page?: number; limit?: number; role?: string; searchTerm?: string }) {
    return this.usersService.findAll(options);
  }

  async getBlockchainStatus() {
    return this.blockchainService.getDetailedStatus();
  }

  async getSystemAuditLogs(options: { 
    startDate?: Date; 
    endDate?: Date; 
    type?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    // This would require an audit log service
    // Returning placeholder data
    return {
      logs: [],
      pagination: {
        total: 0,
        page: options.page || 1,
        limit: options.limit || 10,
        pages: 0,
      },
    };
  }
}
