import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddUnitIdToLeadsAndDeals1693248500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unit_id to leads table
    await queryRunner.addColumn(
      'leads',
      new TableColumn({
        name: 'unit_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // Add unit_id to deals table
    await queryRunner.addColumn(
      'deals',
      new TableColumn({
        name: 'unit_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    // Add foreign key for leads.unit_id -> properties.id
    await queryRunner.createForeignKey(
      'leads',
      new TableForeignKey({
        columnNames: ['unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'properties',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add foreign key for deals.unit_id -> properties.id
    await queryRunner.createForeignKey(
      'deals',
      new TableForeignKey({
        columnNames: ['unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'properties',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );

    // Add indexes for better performance
    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_UNIT_ID',
        columnNames: ['unit_id'],
      }),
    );
    await queryRunner.createIndex(
      'deals',
      new TableIndex({
        name: 'IDX_DEALS_UNIT_ID',
        columnNames: ['unit_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign keys
    const leadsTable = await queryRunner.getTable('leads');
    const dealsTable = await queryRunner.getTable('deals');

    if (leadsTable) {
      const leadsUnitForeignKey = leadsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('unit_id') !== -1,
      );
      if (leadsUnitForeignKey) {
        await queryRunner.dropForeignKey('leads', leadsUnitForeignKey);
      }
    }

    if (dealsTable) {
      const dealsUnitForeignKey = dealsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('unit_id') !== -1,
      );
      if (dealsUnitForeignKey) {
        await queryRunner.dropForeignKey('deals', dealsUnitForeignKey);
      }
    }

    // Remove columns
    await queryRunner.dropColumn('leads', 'unit_id');
    await queryRunner.dropColumn('deals', 'unit_id');
  }
}
