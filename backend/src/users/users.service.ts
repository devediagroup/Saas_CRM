import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';
import { PermissionsService } from '../auth/services/permissions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private permissionsService: PermissionsService,
  ) {}

  async create(createUserDto: Partial<User>, userId: string): Promise<User> {
    // Check if user has permission to create users
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'users.create',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to create users',
      );
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(companyId?: string, userId?: string): Promise<User[]> {
    // Check if user has permission to read users
    if (userId) {
      const hasPermission = await this.permissionsService.hasPermission(
        userId,
        'users.read',
      );
      if (!hasPermission) {
        throw new ForbiddenException(
          'You do not have permission to read users',
        );
      }
    }

    const query = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company');

    if (companyId) {
      query.where('user.company_id = :companyId', { companyId });
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<User> {
    // Check if user has permission to read users
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'users.read',
    );
    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to read users');
    }

    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['company'],
    });
  }

  async update(
    id: string,
    updateUserDto: Partial<User>,
    userId: string,
  ): Promise<User> {
    // Check if user has permission to update users
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'users.update',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to update users',
      );
    }

    const user = await this.findOne(id, userId);

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if user has permission to delete users
    const hasPermission = await this.permissionsService.hasPermission(
      userId,
      'users.delete',
    );
    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }

    const user = await this.findOne(id, userId);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      last_login_at: new Date(),
      login_attempts: 0, // Reset failed login attempts
    });
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    const user = await this.findOne(id, id); // Use id as userId for self-updates
    await this.usersRepository.update(id, {
      login_attempts: user.login_attempts + 1,
    });
  }

  async getUsersByRole(companyId: string, role: UserRole): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        company_id: companyId,
        role,
        status: UserStatus.ACTIVE,
      },
      relations: ['company'],
    });
  }

  async getUsersByStatus(
    companyId: string,
    status: UserStatus,
  ): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['company'],
    });
  }

  async changeUserRole(
    id: string,
    newRole: UserRole,
    userId: string,
  ): Promise<User> {
    const user = await this.findOne(id, userId);

    // Prevent changing super admin role
    if (
      user.role === UserRole.SUPER_ADMIN &&
      newRole !== UserRole.SUPER_ADMIN
    ) {
      throw new ConflictException('Cannot change super admin role');
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }

  async activateUser(id: string, userId: string): Promise<User> {
    return this.update(id, { status: UserStatus.ACTIVE }, userId);
  }

  async deactivateUser(id: string, userId: string): Promise<User> {
    return this.update(id, { status: UserStatus.INACTIVE }, userId);
  }

  async suspendUser(id: string, userId: string): Promise<User> {
    return this.update(id, { status: UserStatus.SUSPENDED }, userId);
  }

  async verifyEmail(id: string, userId: string): Promise<User> {
    return this.update(id, { is_email_verified: true }, userId);
  }

  async verifyPhone(id: string, userId: string): Promise<User> {
    return this.update(id, { is_phone_verified: true }, userId);
  }

  async getUserStats(companyId: string, userId: string) {
    const users = await this.findAll(companyId, userId);

    const stats = {
      total: users.length,
      active: users.filter((u) => u.status === UserStatus.ACTIVE).length,
      inactive: users.filter((u) => u.status === UserStatus.INACTIVE).length,
      suspended: users.filter((u) => u.status === UserStatus.SUSPENDED).length,
      byRole: {
        [UserRole.SUPER_ADMIN]: users.filter(
          (u) => u.role === UserRole.SUPER_ADMIN,
        ).length,
        [UserRole.COMPANY_ADMIN]: users.filter(
          (u) => u.role === UserRole.COMPANY_ADMIN,
        ).length,
        [UserRole.SALES_MANAGER]: users.filter(
          (u) => u.role === UserRole.SALES_MANAGER,
        ).length,
        [UserRole.SALES_AGENT]: users.filter(
          (u) => u.role === UserRole.SALES_AGENT,
        ).length,
        [UserRole.MARKETING]: users.filter((u) => u.role === UserRole.MARKETING)
          .length,
        [UserRole.SUPPORT]: users.filter((u) => u.role === UserRole.SUPPORT)
          .length,
      },
      recentlyActive: users.filter((u) => {
        if (!u.last_login_at) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return u.last_login_at > sevenDaysAgo;
      }).length,
    };

    return stats;
  }
}
