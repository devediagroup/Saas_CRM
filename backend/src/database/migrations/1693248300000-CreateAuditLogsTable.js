const { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } = require('typeorm');

class CreateAuditLogsTable1693248300000 {
  async up(queryRunner) {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'resource_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: "'success'",
            isNullable: false,
          },
          {
            name: 'severity',
            type: 'varchar',
            length: '20',
            default: "'low'",
            isNullable: false,
          },
          {
            name: 'old_values',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'new_values',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'request_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'response_data',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'response_time_ms',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'stack_trace',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'affected_fields',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'is_sensitive',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_exported',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'exported_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'company_id',
            type: 'varchar',
            length: '36',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // Create indexes
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_COMPANY_ID',
        columnNames: ['company_id']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_USER_ID',
        columnNames: ['user_id']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_ACTION',
        columnNames: ['action']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_RESOURCE',
        columnNames: ['resource']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_STATUS',
        columnNames: ['status']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_SEVERITY',
        columnNames: ['severity']
      })
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({
        name: 'IDX_AUDIT_LOGS_CREATED_AT',
        columnNames: ['created_at']
      })
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'companies',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'audit_logs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable('audit_logs');
  }
}

module.exports = CreateAuditLogsTable1693248300000;
