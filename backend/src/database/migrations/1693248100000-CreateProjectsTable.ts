import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateProjectsTable1693248100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['residential', 'commercial', 'mixed', 'industrial', 'land'],
            default: "'residential'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'planning',
              'in_progress',
              'completed',
              'on_hold',
              'cancelled',
            ],
            default: "'planning'",
            isNullable: false,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'state',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'expected_completion_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'actual_completion_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'images',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'videos',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'documents',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'total_area',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'total_units',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'total_investment',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'current_investment',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'floors',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'amenities',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'features',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'specifications',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'progress_updates',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'team',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'milestones',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'custom_fields',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'seo_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'developer_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'company_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_COMPANY_ID',
        columnNames: ['company_id'],
      }),
    );

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_DEVELOPER_ID',
        columnNames: ['developer_id'],
      }),
    );

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_TYPE',
        columnNames: ['type'],
      }),
    );

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_LOCATION',
        columnNames: ['city', 'state', 'country'],
      }),
    );

    await queryRunner.createIndex(
      'projects',
      new TableIndex({
        name: 'IDX_PROJECTS_NAME',
        columnNames: ['name'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        columnNames: ['developer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'developers',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('projects');
  }
}
