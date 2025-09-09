import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import {
  Company,
  SubscriptionPlan,
} from '../companies/entities/company.entity';
import { validatePasswordStrength } from '../validators/password.validator';

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    companyId: string;
    companyName: string;
  };
  company: {
    id: string;
    name: string;
    subscriptionPlan: SubscriptionPlan;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId, userId); // Assuming findOne can be used this way
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Return a DTO to avoid exposing sensitive fields
    const { password_hash, ...result } = user;
    return result;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.usersService.findOneWithPermissions(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (user.role === 'super_admin') {
      // Return all possible permissions for super_admin
      return ['leads.create', 'leads.read', 'leads.update', 'leads.delete', /* ... all other permissions */];
    }
    return user.permissions.map(p => p.name);
  }

  async login(user: User): Promise<AuthResponse> {
    // Get company details
    const company = await this.companiesService.findOne(user.company_id);

    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
    };

    // Debug: Check JWT service configuration
    console.log('🔐 Attempting to sign JWT token...');
    try {
      const accessToken = this.jwtService.sign(payload);
      console.log('✅ JWT token signed successfully');

      // Update last login
      await this.usersService.updateLastLogin(user.id);

      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          companyId: user.company_id,
          companyName: company.name,
        },
        company: {
          id: company.id,
          name: company.name,
          subscriptionPlan: company.subscription_plan,
        },
      };
    } catch (error) {
      console.error('❌ JWT signing failed:', error.message);
      console.error('🔍 Debug info:');
      console.error('  - JWT_SECRET defined:', !!process.env.JWT_SECRET);
      console.error('  - JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
      console.error('  - NODE_ENV:', process.env.NODE_ENV);
      throw new Error(`JWT signing failed: ${error.message}`);
    }
  }

  async register(registerData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(registerData.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(
      registerData.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if company name is taken
    const existingCompany = await this.companiesService.findByName(
      registerData.companyName,
    );
    if (existingCompany) {
      throw new ConflictException('Company with this name already exists');
    }

    // Create company
    const company = await this.companiesService.create({
      name: registerData.companyName,
      email: registerData.email,
      phone: registerData.phone,
      subscription_plan: SubscriptionPlan.FREE,
      is_trial: true,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 12);

    // Create user
    const user = await this.usersService.create(
      {
        first_name: registerData.firstName,
        last_name: registerData.lastName,
        email: registerData.email,
        password_hash: hashedPassword,
        phone: registerData.phone,
        role: UserRole.COMPANY_ADMIN,
        company_id: company.id,
        status: UserStatus.ACTIVE,
        is_email_verified: false, // In production, send verification email
      },
      company.id,
    ); // Use company.id as userId for initial creation

    // Auto-login after registration
    return this.login(user);
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.company_id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    const user = await this.usersService.findOne(userId, userId);

    // Verify old password
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      user.password_hash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await this.usersService.update(
      userId,
      { password_hash: hashedPassword },
      userId,
    );
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message:
          'If an account with this email exists, a reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password_reset' },
      { expiresIn: '1h' },
    );

    // Save reset token (in production, save hashed token in database)
    await this.usersService.update(
      user.id,
      {
        password_reset_token: resetToken,
        password_reset_expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
      user.id,
    );

    // In production, send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return {
      message:
        'If an account with this email exists, a reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'New password does not meet security requirements',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength,
      });
    }

    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'password_reset') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersService.findOne(payload.sub, payload.sub);

      if (!user || user.password_reset_token !== token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (
        user.password_reset_expires_at &&
        user.password_reset_expires_at < new Date()
      ) {
        throw new UnauthorizedException('Token has expired');
      }

      // Check if new password is different from current password
      const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await this.usersService.update(
        user.id,
        {
          password_hash: hashedPassword,
          password_reset_token: undefined,
          password_reset_expires_at: undefined,
        },
        user.id,
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
