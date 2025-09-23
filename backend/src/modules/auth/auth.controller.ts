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
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { EnsService } from '../../common/ens.service';
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
  @IsString({ message: 'Wallet address or ENS name must be a string' })
  @IsNotEmpty({ message: 'Wallet address or ENS name is required' })
  address: string;

  @IsString({ message: 'Signature must be a string' })
  @IsNotEmpty({ message: 'Signature is required' })
  signature: string;

  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}

class WalletRegisterDto {
  @IsString({ message: 'Wallet address or ENS name must be a string' })
  @IsNotEmpty({ message: 'Wallet address or ENS name is required' })
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
  @IsString({ message: 'Wallet address or ENS name must be a string' })
  @IsNotEmpty({ message: 'Wallet address or ENS name is required' })
  walletAddress: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly ensService: EnsService,
  ) {}

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

  @Get('ens/resolve')
  async resolveEns(
    @Query('name') ensName: string, 
    @Query('address') address: string,
    @Query('network') network?: 'mainnet' | 'sepolia'
  ) {
    try {
      if (ensName && !address) {
        // Resolve ENS name to address
        if (!this.ensService.isValidEnsName(ensName)) {
          throw new BadRequestException('Invalid ENS name format');
        }

        const resolvedAddress = await this.ensService.resolveEnsToAddress(ensName, network);
        if (!resolvedAddress) {
          return {
            ensName,
            address: null,
            resolved: false,
            network: network || 'both',
            message: 'ENS name could not be resolved',
          };
        }

        const metadata = await this.ensService.getEnsMetadata(resolvedAddress, network);
        return {
          ensName,
          address: resolvedAddress,
          resolved: true,
          network: metadata.network || network || 'mainnet',
          metadata,
        };
      } else if (address && !ensName) {
        // Reverse resolve address to ENS name
        if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new BadRequestException('Invalid Ethereum address format');
        }

        const metadata = await this.ensService.getEnsMetadata(address, network);
        const formatted = this.ensService.formatAddressWithEns(address, metadata.name, metadata.network);

        return {
          address,
          ensName: metadata.name,
          resolved: !!metadata.name,
          displayName: formatted.displayName,
          network: metadata.network || network || 'both',
          metadata,
        };
      } else {
        throw new BadRequestException('Please provide either "name" or "address" parameter, not both');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('wallet/ens')
  async getWalletEns(@Request() req) {
    try {
      const user = req.user;
      
      if (!user.walletAddress) {
        return {
          hasWallet: false,
          message: 'No wallet linked to this account',
        };
      }

      const metadata = await this.ensService.getEnsMetadata(user.walletAddress);
      const formatted = this.ensService.formatAddressWithEns(user.walletAddress, metadata.name, metadata.network);

      return {
        hasWallet: true,
        wallet: {
          ...formatted,
          metadata: metadata.name ? {
            avatar: metadata.avatar,
            description: metadata.description,
            url: metadata.url,
            social: {
              twitter: metadata.twitter,
              github: metadata.github,
            }
          } : null,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('ens/network-status')
  async getNetworkStatus() {
    try {
      const connectivity = await this.ensService.testNetworkConnectivity();
      const currentNetwork = this.ensService.getCurrentNetwork();

      return {
        currentNetwork,
        connectivity,
        supportedNetworks: ['mainnet', 'sepolia'],
        ensSupport: {
          mainnet: 'Full ENS support',
          sepolia: 'Testnet ENS support'
        }
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
