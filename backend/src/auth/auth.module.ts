import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => UsersModule),
    CompaniesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PermissionsService, JwtStrategy, PermissionGuard],
  exports: [AuthService, PermissionsService, PermissionGuard],
})
export class AuthModule { }
