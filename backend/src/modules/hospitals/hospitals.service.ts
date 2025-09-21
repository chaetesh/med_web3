import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './schemas/hospital.schema';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/schemas/user.schema';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';
import { UpdateHospitalProfileDto } from './dto/update-hospital-profile.dto';
import { HospitalStatus } from '../admin/dto/update-hospital-status.dto';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    private readonly usersService: UsersService,
  ) {}

  async getHospitalById(id: string): Promise<Hospital> {
    const hospital = await this.hospitalModel.findById(id).exec();
    
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${id} not found`);
    }
    
    return hospital;
  }
  
  async create(hospitalData: Partial<Hospital>): Promise<Hospital> {
    // Check if a hospital with the same email already exists
    if (hospitalData.email) {
      const existingHospital = await this.hospitalModel.findOne({ email: hospitalData.email }).exec();
      if (existingHospital) {
        throw new BadRequestException(`Hospital with email ${hospitalData.email} already exists`);
      }
    }
    
    const newHospital = new this.hospitalModel(hospitalData);
    return await newHospital.save();
  }

  async updateStatus(
    hospitalId: string, 
    status: HospitalStatus,
    notes: string
  ): Promise<Hospital> {
    const hospital = await this.getHospitalById(hospitalId);
    
    // Update the status
    hospital['status'] = status; // Adding as a dynamic property since it's not in the schema yet
    hospital['notes'] = notes;
    
    return hospital.save();
  }

  async findAll(options: { page?: number; limit?: number; status?: string }): Promise<{ hospitals: Hospital[]; pagination: any }> {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;
    
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    const hospitals = await this.hospitalModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .exec();
      
    const total = await this.hospitalModel.countDocuments(query).exec();
    
    return {
      hospitals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findAllPublic(options: { 
    page?: number; 
    limit?: number; 
    city?: string; 
    state?: string; 
    search?: string;
  }): Promise<{ hospitals: Hospital[]; pagination: any }> {
    const { page = 1, limit = 50, city, state, search } = options;
    const skip = (page - 1) * limit;
    
    const query: any = { isActive: true };
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    if (state) {
      query.state = new RegExp(state, 'i');
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }
    
    const hospitals = await this.hospitalModel
      .find(query)
      .select('name address city state phone email licenseNumber')
      .skip(skip)
      .limit(limit)
      .exec();
      
    const total = await this.hospitalModel.countDocuments(query).exec();
    
    return {
      hospitals,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateHospitalProfile(
    hospitalId: string, 
    updateProfileDto: UpdateHospitalProfileDto
  ): Promise<Hospital> {
    const hospital = await this.getHospitalById(hospitalId);
    
    // Simply assign the update data
    Object.assign(hospital, updateProfileDto);
    return hospital.save();
  }

  async getHospitalDoctors(
    hospitalId: string,
    options: { page?: number; limit?: number; department?: string }
  ) {
    const { page = 1, limit = 10, department } = options;
    const skip = (page - 1) * limit;
    
    const query: any = { 
      role: UserRole.DOCTOR,
      hospitalId 
    };
    
    if (department) {
      query.department = department;
    }
    
    const doctors = await this.usersService.findByQuery(query, skip, limit);
    const total = await this.usersService.countByQuery(query);
    
    return {
      doctors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getHospitalDoctorsPublic(
    hospitalId: string,
    options: { page?: number; limit?: number; department?: string; specialization?: string; search?: string }
  ) {
    const { page = 1, limit = 50, department, specialization, search } = options;
    const skip = (page - 1) * limit;
    
    // First verify hospital exists and is active
    const hospital = await this.hospitalModel.findOne({ _id: hospitalId, isActive: true });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID ${hospitalId} not found or inactive`);
    }
    
    const query: any = { 
      role: UserRole.DOCTOR,
      hospitalId,
      isActive: true
    };
    
    if (department) {
      query.department = new RegExp(department, 'i');
    }
    
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') }
      ];
    }
    
    // Get all doctors data but filter sensitive information before returning
    const allDoctors = await this.usersService.findByQuery(query, skip, limit);
    const total = await this.usersService.countByQuery(query);
    
    // Filter out sensitive information for public access
    const doctors = allDoctors.map(doctor => ({
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      specialization: doctor['specialization'] || 'General',
      department: doctor['department'] || 'General',
      licenseNumber: doctor['licenseNumber'] || '',
      yearsOfExperience: doctor['yearsOfExperience'] || 0,
      qualifications: doctor['qualifications'] || []
    }));
    
    return {
      hospital: {
        id: hospital._id,
        name: hospital.name,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state
      },
      doctors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async addDoctor(hospitalId: string, createDoctorDto: CreateDoctorDto) {
    // Create a random temporary password if needed
    let temporaryPassword: string | undefined;
    
    if (createDoctorDto.temporaryPassword) {
      temporaryPassword = Math.random().toString(36).slice(-10);
    }
    
    // Create user with basic info
    const newDoctor = await this.usersService.create({
      email: createDoctorDto.email,
      firstName: createDoctorDto.firstName,
      lastName: createDoctorDto.lastName,
      password: temporaryPassword,
      role: UserRole.DOCTOR,
      hospitalId,
      isActive: true,
      // phone and other doctor-specific fields would be stored in a separate doctor profile collection
    });
    
    // Add doctor-specific fields as metadata
    // This would require extending the user schema
    // For now, we'll assume these properties are stored elsewhere or as custom fields
    
    return {
      message: 'Doctor added successfully',
      doctorId: newDoctor.id,
      ...(temporaryPassword && { temporaryPassword })
    };
  }

  async checkDoctorBelongsToHospital(doctorId: string, hospitalId: string): Promise<boolean> {
    const doctor = await this.usersService.findById(doctorId);
    
    if (!doctor || doctor.role !== UserRole.DOCTOR) {
      return false;
    }
    
    return doctor.hospitalId === hospitalId;
  }

  async updateDoctorStatus(doctorId: string, updateStatusDto: UpdateDoctorStatusDto) {
    const doctor = await this.usersService.findById(doctorId);
    
    if (!doctor || doctor.role !== UserRole.DOCTOR) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }
    
    doctor.isActive = updateStatusDto.status === 'active';
    
    // Store the status reason in a custom field or separate collection
    // For now, we'll just update the isActive property
    await doctor.save();
    
    return {
      message: 'Doctor status updated successfully',
      doctorId,
      status: updateStatusDto.status
    };
  }

  async getHospitalPatients(
    hospitalId: string,
    options: { page?: number; limit?: number; doctorId?: string }
  ) {
    const { page = 1, limit = 10, doctorId } = options;
    
    // This requires a join between patients and medical records or appointments
    // to find patients who have been treated at this hospital
    // Implementation will depend on your specific data model
    
    // Placeholder implementation
    return {
      patients: [],
      pagination: {
        total: 0,
        page,
        limit,
        pages: 0
      }
    };
  }

  async getHospitalAnalytics(hospitalId: string) {
    const hospital = await this.getHospitalById(hospitalId);
    
    // Get doctor count
    const doctorCount = await this.usersService.countByQuery({
      role: UserRole.DOCTOR,
      hospitalId
    });
    
    // This would typically join with other collections to get actual metrics
    // For now, returning placeholder data
    
    return {
      name: hospital.name,
      metrics: {
        totalDoctors: doctorCount,
        totalPatients: 0, // Would require a join/aggregate
        totalAppointments: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0
        },
        records: {
          created: 0,
          accessed: 0
        }
      },
      departments: [],
      utilization: {
        doctorUtilization: 0,
        resourceUtilization: 0
      }
    };
  }

  async getBillingReports(hospitalId: string, startDate: Date, endDate: Date) {
    // This would typically require a join with billing/payments collection
    // Returning placeholder data for now
    
    return {
      summary: {
        totalRevenue: 0,
        totalBilled: 0,
        totalPending: 0,
        insuranceClaims: 0
      },
      byDepartment: [],
      byDoctor: []
    };
  }
}
