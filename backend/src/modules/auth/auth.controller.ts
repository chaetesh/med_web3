import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
} from 'class-validator';

// DTOs
class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, and numbers or special characters',
  })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsOptional()
  @IsString({ message: 'Hospital ID must be a string' })
  hospitalId?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'License number must be a string' })
  licenseNumber?: string;
}

class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

class WalletLoginDto {
  @IsString({ message: 'Wallet address must be a string' })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum address format',
  })
  address: string;

  @IsString({ message: 'Signature must be a string' })
  @IsNotEmpty({ message: 'Signature is required' })
  signature: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}

class WalletRegisterDto {
  @IsString({ message: 'Wallet address must be a string' })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum address format',
  })
  address: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsEnum(UserRole, { message: 'Invalid user role' })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;
}

class LinkWalletDto {
  @IsString({ message: 'Wallet address must be a string' })
  @IsNotEmpty({ message: 'Wallet address is required' })
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum address format',
  })
  walletAddress: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
    try {
      const user = await this.authService.registerWithEmail(
        registerDto.email,
        registerDto.password,
        registerDto.firstName,
        registerDto.lastName,
        registerDto.role,
        registerDto.hospitalId,
        registerDto.phone,
        registerDto.licenseNumber,
      );

      return {
        message: 'User registered successfully',
        userId: user._id,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('wallet/login')
  async walletLogin(
    @Body(new ValidationPipe()) walletLoginDto: WalletLoginDto,
  ) {
    try {
      const user = await this.authService.validateWalletSignature(
        walletLoginDto.address,
        walletLoginDto.signature,
        walletLoginDto.message,
      );

      return this.authService.login(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('wallet/register')
  async walletRegister(
    @Body(new ValidationPipe()) walletRegisterDto: WalletRegisterDto,
  ) {
    try {
      const user = await this.authService.registerWithWallet(
        walletRegisterDto.address,
        walletRegisterDto.firstName,
        walletRegisterDto.lastName,
        walletRegisterDto.email,
        walletRegisterDto.role,
      );

      return {
        message: 'User registered with wallet successfully',
        userId: user._id,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('wallet/link')
  async linkWallet(
    @Request() req,
    @Body(new ValidationPipe()) linkWalletDto: LinkWalletDto,
  ) {
    try {
      await this.authService.linkWalletToUser(
        req.user.id,
        linkWalletDto.walletAddress,
      );

      return { message: 'Wallet linked successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }
}
