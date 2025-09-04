import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { User as UserDecorator } from '../auth/decorators/user.decorator';

class CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role: UserRole;
  company_id: string;
}

class UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  preferences?: Record<string, any>;
}

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @RequirePermission('users.create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.create(createUserDto, userId);
  }

  @Get()
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Get all users for company' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [User],
  })
  async findAll(
    @UserDecorator('companyId') companyId: string,
    @UserDecorator('id') userId: string,
  ): Promise<User[]> {
    return this.usersService.findAll(companyId, userId);
  }

  @Get('stats')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Get user statistics for company' })
  @ApiResponse({
    status: 200,
    description: 'User stats retrieved successfully',
  })
  async getUserStats(
    @UserDecorator('companyId') companyId: string,
    @UserDecorator('id') userId: string,
  ) {
    return this.usersService.getUserStats(companyId, userId);
  }

  @Get('by-role/:role')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [User],
  })
  async getUsersByRole(
    @Param('role') role: UserRole,
    @UserDecorator('companyId') companyId: string,
  ): Promise<User[]> {
    return this.usersService.getUsersByRole(companyId, role);
  }

  @Get('by-status/:status')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Get users by status' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [User],
  })
  async getUsersByStatus(
    @Param('status') status: UserStatus,
    @UserDecorator('companyId') companyId: string,
  ): Promise<User[]> {
    return this.usersService.getUsersByStatus(companyId, status);
  }

  @Get(':id')
  @RequirePermission('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.findOne(id, userId);
  }

  @Patch(':id')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto, userId);
  }

  @Patch(':id/role')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({
    status: 200,
    description: 'User role changed successfully',
    type: User,
  })
  async changeRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole },
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.changeUserRole(id, body.role, userId);
  }

  @Patch(':id/activate')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
    type: User,
  })
  async activate(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.activateUser(id, userId);
  }

  @Patch(':id/deactivate')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: User,
  })
  async deactivate(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.deactivateUser(id, userId);
  }

  @Patch(':id/suspend')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
    type: User,
  })
  async suspend(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.suspendUser(id, userId);
  }

  @Patch(':id/verify-email')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: User,
  })
  async verifyEmail(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.verifyEmail(id, userId);
  }

  @Patch(':id/verify-phone')
  @RequirePermission('users.update')
  @ApiOperation({ summary: 'Verify user phone' })
  @ApiResponse({
    status: 200,
    description: 'Phone verified successfully',
    type: User,
  })
  async verifyPhone(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<User> {
    return this.usersService.verifyPhone(id, userId);
  }

  @Delete(':id')
  @RequirePermission('users.delete')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id') id: string,
    @UserDecorator('id') userId: string,
  ): Promise<{ message: string }> {
    await this.usersService.remove(id, userId);
    return { message: 'User deleted successfully' };
  }
}
