import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum PropertyType {
  APARTMENT = 'apartment',
  VILLA = 'villa',
  OFFICE = 'office',
  SHOP = 'shop',
  LAND = 'land',
  WAREHOUSE = 'warehouse'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  SOLD = 'sold',
  RENTED = 'rented',
  UNDER_CONSTRUCTION = 'under_construction',
  OFF_MARKET = 'off_market'
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent'
}

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: PropertyType
  })
  property_type: PropertyType;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE
  })
  status: PropertyStatus;

  @Column({
    type: 'enum',
    enum: ListingType,
    default: ListingType.SALE
  })
  listing_type: ListingType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  rent_price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'int' })
  bedrooms: number;

  @Column({ type: 'int' })
  bathrooms: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  area: number; // in square meters

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ nullable: true })
  total_floors: number;

  @Column({ nullable: true })
  year_built: number;

  @Column({ type: 'json', nullable: true })
  features: string[];

  @Column({ type: 'json', nullable: true })
  amenities: string[];

  @Column()
  address: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  zip_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true })
  videos: string[];

  @Column({ type: 'json', nullable: true })
  documents: string[];

  @Column({ type: 'json', nullable: true })
  virtual_tour: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  inquiry_count: number;

  @Column({ type: 'date', nullable: true })
  available_from: Date;

  @Column({ type: 'json', nullable: true })
  custom_fields: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  seo_data: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  company_id: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Deal, deal => deal.property)
  deals: Deal[];

  @OneToMany(() => Activity, activity => activity.property)
  activities: Activity[];
}