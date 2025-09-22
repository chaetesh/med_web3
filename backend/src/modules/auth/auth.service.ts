import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        return null;
      }

      // Check if user account is active
      if (!user.isActive) {
        this.logger.warn(`Login attempt for inactive user: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      // Update last login time
      await this.usersService.updateLastLogin(user._id as string);

      const { password: _, ...result } = user.toObject();
      return result;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      return null;
    }
  }

  async login(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateWalletSignature(
    address: string,
    signature: string,
    message: string,
  ): Promise<any> {
    try {
      // Verify wallet signature logic will go here
      // This would typically use ethers.js to recover the address from the signature
      // For now, we'll just find the user by wallet address

      const user = await this.usersService.findByWalletAddress(address);

      if (!user) {
        throw new UnauthorizedException('Wallet address not found');
      }

      // Update last login time
      await this.usersService.updateLastLogin(user._id as string);

      return user;
    } catch (error) {
      this.logger.error(
        `Error validating wallet signature: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Invalid wallet signature');
    }
  }

  async registerWithEmail(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string,
    hospitalId?: string,
    phone?: string,
    licenseNumber?: string,
  ): Promise<User> {
    try {
      // Check if password is valid before hashing
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password provided');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user data object
      const userData: any = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any, // Type cast to fix the type error
        profileData: {},
      };

      // Add hospitalId if provided and valid
      if (hospitalId && hospitalId.trim()) {
        userData.hospitalId = hospitalId;
      }

      // Add phone to profileData if provided
      if (phone && phone.trim()) {
        userData.profileData.phone = phone;
      }

      // Create user
      const user = await this.usersService.create(userData);

      // If this is a doctor and license number is provided, log it for future doctor profile creation
      if (role === 'doctor' && licenseNumber && licenseNumber.trim()) {
        this.logger.log(`Doctor registered with license: ${licenseNumber} - will need doctor profile creation`);
        // TODO: Create doctor profile with license number via doctors service
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Error registering user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async registerWithWallet(
    address: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
  ): Promise<User> {
    try {
      // Generate a secure random password
      const randomPassword =
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2);

      // Hash password
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create user with wallet address
      const user = await this.usersService.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any, // Type cast to fix the type error
        walletAddress: address,
      });

      return user;
    } catch (error) {
      this.logger.error(
        `Error registering user with wallet: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async linkWalletToUser(userId: string, walletAddress: string): Promise<User> {
    try {
      const user = await this.usersService.updateWalletAddress(
        userId,
        walletAddress,
      );
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Error linking wallet to user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
