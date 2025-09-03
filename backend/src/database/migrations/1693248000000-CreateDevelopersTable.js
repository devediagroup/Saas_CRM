const { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } = require('typeorm');

class CreateDevelopersTable1693248000000 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'developers',
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
            name: 'contact_info',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'website_url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'social_media',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'business_hours',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'specializations',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'certifications',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'awards',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'years_experience',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'completed_projects',
            type: 'int',
            default: 0,
            isNullable: false,
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
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            default: "'residential'",
            isNullable: false,
          },
          {
            name: 'company_id',
            type: 'varchar',
            length: '36',
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
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'developers',
      new TableIndex({
        name: 'IDX_DEVELOPERS_COMPANY_ID',
        columnNames: ['company_id']
      })
    );

    await queryRunner.createIndex(
      'developers',
      new TableIndex({
        name: 'IDX_DEVELOPERS_STATUS',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'developers',
      new TableIndex({
        name: 'IDX_DEVELOPERS_TYPE',
        columnNames: ['type']
      })
    );

    await queryRunner.createIndex(
      'developers',
      new TableIndex({
        name: 'IDX_DEVELOPERS_NAME',
        columnNames: ['name']
      })
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'developers',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('developers');
  }
}

module.exports = CreateDevelopersTable1693248000000;
