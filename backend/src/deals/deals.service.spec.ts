import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealsService } from './deals.service';
import { Deal, DealStage, DealPriority, DealType } from './entities/deal.entity';

describe('DealsService', () => {
  let service: DealsService;
  let repository: Repository<Deal>;

  const mockDeal: Deal = {
    id: 'test-id',
    title: 'Test Deal',
    description: 'Test Description',
    amount: 100000,
    currency: 'SAR',
    stage: DealStage.PROSPECT,
    priority: DealPriority.MEDIUM,
    deal_type: DealType.SALE,
    probability: 50,
    expected_close_date: new Date(),
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
      getMany: jest.fn().mockResolvedValue([mockDeal]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealsService,
        {
          provide: getRepositoryToken(Deal),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DealsService>(DealsService);
    repository = module.get<Repository<Deal>>(getRepositoryToken(Deal));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a deal', async () => {
      const createDto = {
        title: 'New Deal',
        description: 'New Description',
        amount: 150000,
        company_id: 'company-id',
      };

      mockRepository.create.mockReturnValue(mockDeal);
      mockRepository.save.mockResolvedValue(mockDeal);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDeal);
      expect(result).toEqual(mockDeal);
    });
  });

  describe('findAll', () => {
    it('should return all deals for a company', async () => {
      mockRepository.find.mockResolvedValue([mockDeal]);

      const result = await service.findAll('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company', 'lead', 'property', 'assigned_to'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('findOne', () => {
    it('should return a deal by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDeal);

      const result = await service.findOne('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'lead', 'property', 'assigned_to', 'activities'],
      });
      expect(result).toEqual(mockDeal);
    });

    it('should throw NotFoundException when deal not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow('Deal with ID nonexistent-id not found');
    });
  });

  describe('update', () => {
    it('should update a deal', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedDeal = { ...mockDeal, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockDeal);
      mockRepository.save.mockResolvedValue(updatedDeal);

      const result = await service.update('test-id', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'lead', 'property', 'assigned_to', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDeal);
      expect(result).toEqual(updatedDeal);
    });
  });

  describe('remove', () => {
    it('should remove a deal', async () => {
      mockRepository.findOne.mockResolvedValue(mockDeal);
      mockRepository.remove.mockResolvedValue(mockDeal);

      await service.remove('test-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'lead', 'property', 'assigned_to', 'activities'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockDeal);
    });
  });

  describe('getDealsByStage', () => {
    it('should return deals by stage', async () => {
      mockRepository.find.mockResolvedValue([mockDeal]);

      const result = await service.getDealsByStage('company-id', DealStage.PROSPECT);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          stage: DealStage.PROSPECT,
        },
        relations: ['lead', 'property', 'assigned_to'],
      });
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('getDealsByPriority', () => {
    it('should return deals by priority', async () => {
      mockRepository.find.mockResolvedValue([mockDeal]);

      const result = await service.getDealsByPriority('company-id', DealPriority.MEDIUM);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          company_id: 'company-id',
          priority: DealPriority.MEDIUM,
        },
        relations: ['lead', 'property', 'assigned_to'],
      });
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('updateDealStage', () => {
    it('should update deal stage', async () => {
      const updatedDeal = { ...mockDeal, stage: DealStage.CLOSED_WON, actual_close_date: new Date() };

      mockRepository.findOne.mockResolvedValue(mockDeal);
      mockRepository.save.mockResolvedValue(updatedDeal);

      const result = await service.updateDealStage('test-id', DealStage.CLOSED_WON);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'lead', 'property', 'assigned_to', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDeal);
      expect(result).toEqual(updatedDeal);
    });
  });

  describe('assignDeal', () => {
    it('should assign deal to user', async () => {
      const updatedDeal = { ...mockDeal, assigned_to_id: 'user-id' };

      mockRepository.findOne.mockResolvedValue(mockDeal);
      mockRepository.save.mockResolvedValue(updatedDeal);

      const result = await service.assignDeal('test-id', 'user-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        relations: ['company', 'lead', 'property', 'assigned_to', 'activities'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDeal);
      expect(result).toEqual(updatedDeal);
    });
  });

  describe('getPipelineView', () => {
    it('should return pipeline view', async () => {
      const deals = [
        { ...mockDeal, stage: DealStage.PROSPECT },
        { ...mockDeal, stage: DealStage.QUALIFIED },
      ];

      mockRepository.find.mockResolvedValue(deals);

      const result = await service.getPipelineView('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company', 'lead', 'property', 'assigned_to'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({
        [DealStage.PROSPECT]: [deals[0]],
        [DealStage.QUALIFIED]: [deals[1]],
        [DealStage.PROPOSAL]: [],
        [DealStage.NEGOTIATION]: [],
        [DealStage.CONTRACT]: [],
        [DealStage.CLOSED_WON]: [],
        [DealStage.CLOSED_LOST]: [],
      });
    });
  });

  describe('getOverdueDeals', () => {
    it('should return overdue deals', async () => {
      const overdueDeal = { ...mockDeal, expected_close_date: new Date(Date.now() - 86400000) };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([overdueDeal]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getOverdueDeals('company-id');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('deal');
      expect(result).toEqual([overdueDeal]);
    });
  });

  describe('searchDeals', () => {
    it('should search deals', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockDeal]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchDeals('company-id', 'test search');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('deal');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('deal.company_id = :companyId', { companyId: 'company-id' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(deal.title LIKE :search OR deal.description LIKE :search)',
        { search: '%test search%' }
      );
      expect(result).toEqual([mockDeal]);
    });
  });

  describe('getDealStats', () => {
    it('should return deal statistics', async () => {
      const deals = [
        { ...mockDeal, stage: DealStage.CLOSED_WON, amount: 100000 },
        { ...mockDeal, stage: DealStage.PROSPECT, amount: 50000 },
      ];

      mockRepository.find.mockResolvedValue(deals);

      const result = await service.getDealStats('company-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { company_id: 'company-id' },
        relations: ['company', 'lead', 'property', 'assigned_to'],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({
        total: 2,
        byStage: {
          [DealStage.PROSPECT]: 1,
          [DealStage.QUALIFIED]: 0,
          [DealStage.PROPOSAL]: 0,
          [DealStage.NEGOTIATION]: 0,
          [DealStage.CONTRACT]: 0,
          [DealStage.CLOSED_WON]: 1,
          [DealStage.CLOSED_LOST]: 0,
        },
        byPriority: {
          [DealPriority.LOW]: 0,
          [DealPriority.MEDIUM]: 2,
          [DealPriority.HIGH]: 0,
          [DealPriority.URGENT]: 0,
        },
        byType: {
          [DealType.SALE]: 2,
          [DealType.RENT]: 0,
          [DealType.MANAGEMENT]: 0,
          [DealType.CONSULTATION]: 0,
        },
        conversionRate: '50.0',
        totalValue: 150000,
        weightedValue: 75000,
        averageDealSize: 75000,
        overdue: 0,
      });
    });
  });

  describe('getUpcomingDeals', () => {
    it('should return upcoming deals', async () => {
      const upcomingDeal = { ...mockDeal, expected_close_date: new Date(Date.now() + 86400000) };
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([upcomingDeal]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUpcomingDeals('company-id', 7);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('deal');
      expect(result).toEqual([upcomingDeal]);
    });
  });
});
