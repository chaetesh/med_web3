import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);

    if (!user) {
      // Check if user exists but is inactive
      try {
        const userExists = await this.usersService.findByEmail(email);
        if (userExists && !userExists.isActive) {
          throw new UnauthorizedException('Your account is pending approval. Please wait for admin approval or contact support.');
        }
      } catch (error) {
        // If user lookup fails, just proceed with generic error
      }
      
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
