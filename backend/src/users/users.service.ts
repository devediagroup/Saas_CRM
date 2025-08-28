import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(companyId?: string): Promise<User[]> {
    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company');

    if (companyId) {
      query.where('user.company_id = :companyId', { companyId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<User> {
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

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      last_login_at: new Date(),
      login_attempts: 0, // Reset failed login attempts
    });
  }

  async incrementLoginAttempts(id: string): Promise<void> {
    const user = await this.findOne(id);
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

  async getUsersByStatus(companyId: string, status: UserStatus): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        company_id: companyId,
        status,
      },
      relations: ['company'],
    });
  }

  async changeUserRole(id: string, newRole: UserRole): Promise<User> {
    const user = await this.findOne(id);

    // Prevent changing super admin role
    if (user.role === UserRole.SUPER_ADMIN && newRole !== UserRole.SUPER_ADMIN) {
      throw new ConflictException('Cannot change super admin role');
    }

    user.role = newRole;
    return this.usersRepository.save(user);
  }

  async activateUser(id: string): Promise<User> {
    return this.update(id, { status: UserStatus.ACTIVE });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.update(id, { status: UserStatus.INACTIVE });
  }

  async suspendUser(id: string): Promise<User> {
    return this.update(id, { status: UserStatus.SUSPENDED });
  }

  async verifyEmail(id: string): Promise<User> {
    return this.update(id, { is_email_verified: true });
  }

  async verifyPhone(id: string): Promise<User> {
    return this.update(id, { is_phone_verified: true });
  }

  async getUserStats(companyId: string) {
    const users = await this.findAll(companyId);

    const stats = {
      total: users.length,
      active: users.filter(u => u.status === UserStatus.ACTIVE).length,
      inactive: users.filter(u => u.status === UserStatus.INACTIVE).length,
      suspended: users.filter(u => u.status === UserStatus.SUSPENDED).length,
      byRole: {
        [UserRole.SUPER_ADMIN]: users.filter(u => u.role === UserRole.SUPER_ADMIN).length,
        [UserRole.COMPANY_ADMIN]: users.filter(u => u.role === UserRole.COMPANY_ADMIN).length,
        [UserRole.SALES_MANAGER]: users.filter(u => u.role === UserRole.SALES_MANAGER).length,
        [UserRole.SALES_AGENT]: users.filter(u => u.role === UserRole.SALES_AGENT).length,
        [UserRole.MARKETING]: users.filter(u => u.role === UserRole.MARKETING).length,
        [UserRole.SUPPORT]: users.filter(u => u.role === UserRole.SUPPORT).length,
      },
      recentlyActive: users.filter(u => {
        if (!u.last_login_at) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return u.last_login_at > sevenDaysAgo;
      }).length,
    };

    return stats;
  }
}
