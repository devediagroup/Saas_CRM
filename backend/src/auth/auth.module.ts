import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './auth.controller';

// Services
import { AuthService } from './auth.service';
import { PermissionsService } from './services/permissions.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';

// Guards
import { PermissionGuard } from './guards/permission.guard';

// Entities
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';

// Modules
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('🔐 JWT_SECRET loaded:', secret ? 'YES' : 'NO');
        if (!secret) {
          throw new Error('JWT_SECRET is not defined in environment variables');
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
          },
        };
      },
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    CompaniesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PermissionsService, JwtStrategy, PermissionGuard],
  exports: [AuthService, PermissionsService, PermissionGuard],
})
export class AuthModule { }
