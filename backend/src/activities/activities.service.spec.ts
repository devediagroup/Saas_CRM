import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitiesService } from './activities.service';
import { Activity, ActivityType, ActivityStatus, ActivityPriority } from './entities/activity.entity';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let repository: Repository<Activity>;

  const mockActivity: Activity = {
    id: 'test-id',
    title: 'Test Activity',
    description: 'Test Description',
    type: ActivityType.MEETING,
    status: ActivityStatus.SCHEDULED,
    priority: ActivityPriority.MEDIUM,
    scheduled_at: new Date(),
    duration_minutes: 60,
    user_id: 'user-id',
    company_id: 'company-id',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockActivity]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    repository = module.get<Repository<Activity>>(getRepositoryToken(Activity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an activity', async () => {
      const createDto = {
        title: 'New Activity',
        description: 'New Description',
        type: ActivityType.MEETING,
        scheduled_at: new Date(),
        company_id: 'company-id',
        user_id: 'user-id',
      };

      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockActivity);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('findAll', () => {
    it('should return all activities for a company', async () => {
      mockRepository.find.mockResolvedValue([mockActivity]);

      const result = await service.findAll('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company', 'user', 'lead', 'property', 'deal'],
        order: { scheduled_at: 'DESC' },
      });
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('findOne', () => {
    it('should return an activity by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockActivity);

      const result = await service.findOne('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'user', 'lead', 'property', 'deal'],
      });
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException when activity not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow('Activity with ID nonexistent-id not found');
    });
  });

  describe('update', () => {
    it('should update an activity', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedActivity = { ...mockActivity, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(updatedActivity);

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'user', 'lead', 'property', 'deal'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedActivity);
      expect(result).toEqual(updatedActivity);
    });

    it('should set completed_at when status is completed', async () => {
      const updateDto = { status: ActivityStatus.COMPLETED };
      const completedActivity = {
        ...mockActivity,
        ...updateDto,
        completed_at: new Date()
      };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(completedActivity);

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ActivityStatus.COMPLETED,
          completed_at: expect.any(Date),
        })
      );
    });
  });

  describe('remove', () => {
    it('should remove an activity', async () => {
      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.remove.mockResolvedValue(mockActivity);

      await service.remove('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'user', 'lead', 'property', 'deal'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockActivity);
    });
  });

  describe('getActivitiesByStatus', () => {
    it('should return activities by status', async () => {
      mockRepository.find.mockResolvedValue([mockActivity]);

      const result = await service.getActivitiesByStatus('company-id', ActivityStatus.SCHEDULED);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          status: ActivityStatus.SCHEDULED,
        },
        relations: ['user', 'lead', 'property', 'deal'],
      });
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('getActivitiesByType', () => {
    it('should return activities by type', async () => {
      mockRepository.find.mockResolvedValue([mockActivity]);

      const result = await service.getActivitiesByType('company-id', ActivityType.MEETING);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          type: ActivityType.MEETING,
        },
        relations: ['user', 'lead', 'property', 'deal'],
      });
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('getActivitiesByUser', () => {
    it('should return activities by user', async () => {
      mockRepository.find.mockResolvedValue([mockActivity]);

      const result = await service.getActivitiesByUser('company-id', 'user-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          user_id: 'user-id',
        },
        relations: ['lead', 'property', 'deal'],
      });
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('completeActivity', () => {
    it('should complete an activity', async () => {
      const completedActivity = {
        ...mockActivity,
        status: ActivityStatus.COMPLETED,
        completed_at: new Date(),
        outcome: 'Successfully completed',
        notes: 'Good meeting',
      };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(completedActivity);

      const result = await service.completeActivity('test-id', 'Successfully completed', 'Good meeting');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'user', 'lead', 'property', 'deal'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ActivityStatus.COMPLETED,
          outcome: 'Successfully completed',
          notes: 'Good meeting',
          completed_at: expect.any(Date),
        })
      );
      expect(result).toEqual(completedActivity);
    });
  });

  describe('cancelActivity', () => {
    it('should cancel an activity', async () => {
      const cancelledActivity = {
        ...mockActivity,
        status: ActivityStatus.CANCELLED,
        notes: 'Meeting cancelled due to illness',
      };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(cancelledActivity);

      const result = await service.cancelActivity('test-id', 'Meeting cancelled due to illness');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ActivityStatus.CANCELLED,
          notes: 'Meeting cancelled due to illness',
        })
      );
      expect(result).toEqual(cancelledActivity);
    });
  });

  describe('postponeActivity', () => {
    it('should postpone an activity', async () => {
      const newScheduledAt = new Date(Date.now() + 86400000);
      const postponedActivity = {
        ...mockActivity,
        status: ActivityStatus.POSTPONED,
        scheduled_at: newScheduledAt,
        notes: 'Postponed due to scheduling conflict',
      };

      mockRepository.findOne.mockResolvedValue(mockActivity);
      mockRepository.save.mockResolvedValue(postponedActivity);

      const result = await service.postponeActivity('test-id', newScheduledAt, 'Postponed due to scheduling conflict');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ActivityStatus.POSTPONED,
          scheduled_at: newScheduledAt,
          notes: 'Postponed due to scheduling conflict',
        })
      );
      expect(result).toEqual(postponedActivity);
    });
  });

  describe('getOverdueActivities', () => {
    it('should return overdue activities', async () => {
      const overdueActivity = { ...mockActivity, scheduled_at: new Date(Date.now() - 86400000) };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([overdueActivity]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getOverdueActivities('company-id');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('activity');
      expect(result).toEqual([overdueActivity]);
    });
  });

  describe('getUpcomingActivities', () => {
    it('should return upcoming activities', async () => {
      const upcomingActivity = { ...mockActivity, scheduled_at: new Date(Date.now() + 3600000) };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([upcomingActivity]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUpcomingActivities('company-id', 24);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('activity');
      expect(result).toEqual([upcomingActivity]);
    });
  });

  describe('getTodaysActivities', () => {
    it('should return today\'s activities', async () => {
      const todaysActivity = { ...mockActivity, scheduled_at: new Date() };
      const mockQueryBuilder = {
        getMany: jest.fn().mockResolvedValue([todaysActivity]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getTodaysActivities('company-id');

      expect(result).toEqual([todaysActivity]);
    });
  });

  describe('searchActivities', () => {
    it('should search activities', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockActivity]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchActivities('company-id', 'test search');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('activity');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('activity.company_id = :companyId', { companyId: 'company-id' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(activity.title LIKE :search OR activity.description LIKE :search OR activity.outcome LIKE :search OR activity.notes LIKE :search)',
        { search: '%test search%' }
      );
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('getCalendarView', () => {
    it('should return calendar view', async () => {
      const mockQueryBuilder = {
        getMany: jest.fn().mockResolvedValue([mockActivity]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getCalendarView('company-id', 12, 2024);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('activity');
      expect(result).toEqual({
        [mockActivity.scheduled_at.toISOString().split('T')[0]]: [mockActivity],
      });
    });
  });

  describe('getActivityStats', () => {
    it('should return activity statistics', async () => {
      const activities = [
        { ...mockActivity, status: ActivityStatus.COMPLETED, type: ActivityType.MEETING, duration_minutes: 60 },
        { ...mockActivity, status: ActivityStatus.SCHEDULED, type: ActivityType.CALL },
      ];

      mockRepository.find.mockResolvedValue(activities);

      const result = await service.getActivityStats('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company', 'user', 'lead', 'property', 'deal'],
        order: { scheduled_at: 'DESC' },
      });
      expect(result).toEqual({
        total: 2,
        byStatus: {
          [ActivityStatus.SCHEDULED]: 1,
          [ActivityStatus.COMPLETED]: 1,
          [ActivityStatus.CANCELLED]: 0,
          [ActivityStatus.POSTPONED]: 0,
        },
        byType: {
          [ActivityType.CALL]: 1,
          [ActivityType.EMAIL]: 0,
          [ActivityType.MEETING]: 1,
          [ActivityType.WHATSAPP]: 0,
          [ActivityType.SITE_VISIT]: 0,
          [ActivityType.NOTE]: 0,
          [ActivityType.TASK]: 0,
          [ActivityType.FOLLOW_UP]: 0,
          [ActivityType.PRESENTATION]: 0,
          [ActivityType.CONTRACT]: 0,
          [ActivityType.OTHER]: 0,
        },
        byPriority: {
          [ActivityPriority.LOW]: 0,
          [ActivityPriority.MEDIUM]: 2,
          [ActivityPriority.HIGH]: 0,
          [ActivityPriority.URGENT]: 0,
        },
        overdue: 0,
        today: 0,
        upcoming: 0,
        completionRate: '50.0',
        averageDuration: 60,
      });
    });
  });
});
