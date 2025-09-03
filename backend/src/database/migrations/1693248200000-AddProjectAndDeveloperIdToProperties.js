const { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } = require('typeorm');

class AddProjectAndDeveloperIdToProperties1693248200000 {
  async up(queryRunner) {
    // Add project_id column to properties table
    await queryRunner.addColumn(
      'properties',
      new TableColumn({
        name: 'project_id',
        type: 'int',
        isNullable: true,
      })
    );

    // Add developer_id column to properties table
    await queryRunner.addColumn(
      'properties',
      new TableColumn({
        name: 'developer_id',
        type: 'int',
        isNullable: true,
      })
    );

    // Create index for project_id
    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_PROJECT_ID',
        columnNames: ['project_id']
      })
    );

    // Create index for developer_id
    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_DEVELOPER_ID',
        columnNames: ['developer_id']
      })
    );

    // Create foreign key to projects table
    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        columnNames: ['project_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'projects',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );

    // Create foreign key to developers table
    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        columnNames: ['developer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'developers',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );
  }

  async down(queryRunner) {
    // Remove foreign keys
    const table = await queryRunner.getTable('properties');
    if (table) {
      // Remove project_id foreign key
      const projectForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('project_id') !== -1);
      if (projectForeignKey) {
        await queryRunner.dropForeignKey('properties', projectForeignKey);
      }

      // Remove developer_id foreign key
      const developerForeignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('developer_id') !== -1);
      if (developerForeignKey) {
        await queryRunner.dropForeignKey('properties', developerForeignKey);
      }

      // Remove indexes
      const projectIndex = table.indices.find(idx => idx.name === 'IDX_PROPERTIES_PROJECT_ID');
      if (projectIndex) {
        await queryRunner.dropIndex('properties', projectIndex);
      }

      const developerIndex = table.indices.find(idx => idx.name === 'IDX_PROPERTIES_DEVELOPER_ID');
      if (developerIndex) {
        await queryRunner.dropIndex('properties', developerIndex);
      }
    }

    // Remove columns
    await queryRunner.dropColumn('properties', 'project_id');
    await queryRunner.dropColumn('properties', 'developer_id');
  }
}

module.exports = AddProjectAndDeveloperIdToProperties1693248200000;
