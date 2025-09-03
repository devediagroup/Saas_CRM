"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUnitIdToLeadsAndDeals1693248500000 = void 0;
const typeorm_1 = require("typeorm");
class AddUnitIdToLeadsAndDeals1693248500000 {
    async up(queryRunner) {
        // Add unit_id to leads table
        await queryRunner.addColumn('leads', new typeorm_1.TableColumn({
            name: 'unit_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
        }));
        // Add unit_id to deals table
        await queryRunner.addColumn('deals', new typeorm_1.TableColumn({
            name: 'unit_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
        }));
        // Add foreign key for leads.unit_id -> properties.id
        await queryRunner.createForeignKey('leads', new typeorm_1.TableForeignKey({
            columnNames: ['unit_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'properties',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        }));
        // Add foreign key for deals.unit_id -> properties.id
        await queryRunner.createForeignKey('deals', new typeorm_1.TableForeignKey({
            columnNames: ['unit_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'properties',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        }));
    }
    async down(queryRunner) {
        // Remove foreign keys
        const leadsTable = await queryRunner.getTable('leads');
        const dealsTable = await queryRunner.getTable('deals');
        if (leadsTable) {
            const leadsUnitForeignKey = leadsTable.foreignKeys.find((fk) => fk.columnNames.indexOf('unit_id') !== -1);
            if (leadsUnitForeignKey) {
                await queryRunner.dropForeignKey('leads', leadsUnitForeignKey);
            }
        }
        if (dealsTable) {
            const dealsUnitForeignKey = dealsTable.foreignKeys.find((fk) => fk.columnNames.indexOf('unit_id') !== -1);
            if (dealsUnitForeignKey) {
                await queryRunner.dropForeignKey('deals', dealsUnitForeignKey);
            }
        }
        // Remove columns
        await queryRunner.dropColumn('leads', 'unit_id');
        await queryRunner.dropColumn('deals', 'unit_id');
    }
}
exports.AddUnitIdToLeadsAndDeals1693248500000 = AddUnitIdToLeadsAndDeals1693248500000;
