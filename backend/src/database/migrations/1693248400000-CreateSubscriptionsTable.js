const { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } = require('typeorm');

class CreateSubscriptionsTable1693248400000 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'plan',
            type: 'varchar',
            length: '20',
            default: "'basic'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'trial'",
            isNullable: false,
          },
          {
            name: 'billing_cycle',
            type: 'varchar',
            length: '20',
            default: "'monthly'",
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'next_billing_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'trial_end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'USD'",
            isNullable: false,
          },
          {
            name: 'features',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'usage_metrics',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'billing_info',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'auto_renew',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
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
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTIONS_COMPANY_ID',
        columnNames: ['company_id']
      })
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTIONS_STATUS',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTIONS_PLAN',
        columnNames: ['plan']
      })
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTIONS_BILLING_CYCLE',
        columnNames: ['billing_cycle']
      })
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTIONS_NEXT_BILLING_DATE',
        columnNames: ['next_billing_date']
      })
    );

    await queryRunner.createIndex(
      'subscriptions',
      new TableIndex({
        name: 'IDX_SUBSCRIPTIONS_END_DATE',
        columnNames: ['end_date']
      })
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'subscriptions',
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
    await queryRunner.dropTable('subscriptions');
  }
}

module.exports = CreateSubscriptionsTable1693248400000;
