'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('borrowing_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      book_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      borrower_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'borrowers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      checkout_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      return_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('BORROWED', 'RETURNED', 'OVERDUE'),
        allowNull: false,
        defaultValue: 'BORROWED',
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for performance optimization
    await queryInterface.addIndex('borrowing_transactions', ['borrower_id']);
    await queryInterface.addIndex('borrowing_transactions', ['book_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('borrowing_transactions');
  },
};
