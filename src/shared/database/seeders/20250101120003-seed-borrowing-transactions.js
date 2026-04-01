'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { v4: uuidv4 } = require('uuid');

    // Get existing books and borrowers to link properly
    const books = await queryInterface.sequelize.query(
      'SELECT id FROM books LIMIT 10'
    );
    const borrowers = await queryInterface.sequelize.query(
      'SELECT id FROM borrowers LIMIT 10'
    );

    // Extract IDs from query results
    const bookIds = books[0].map((b) => b.id);
    const borrowerIds = borrowers[0].map((b) => b.id);

    const transactions = [
      {
        id: uuidv4(),
        book_id: bookIds[0],
        borrower_id: borrowerIds[0],
        checkout_date: new Date('2025-03-15'),
        due_date: new Date('2025-04-15'),
        return_date: new Date('2025-04-10'),
        status: 'RETURNED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[1],
        borrower_id: borrowerIds[1],
        checkout_date: new Date('2025-03-20'),
        due_date: new Date('2025-04-20'),
        return_date: null,
        status: 'BORROWED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[2],
        borrower_id: borrowerIds[2],
        checkout_date: new Date('2025-03-01'),
        due_date: new Date('2025-03-31'),
        return_date: null,
        status: 'OVERDUE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[3],
        borrower_id: borrowerIds[3],
        checkout_date: new Date('2025-02-28'),
        due_date: new Date('2025-03-28'),
        return_date: new Date('2025-03-25'),
        status: 'RETURNED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[4],
        borrower_id: borrowerIds[4],
        checkout_date: new Date('2025-03-22'),
        due_date: new Date('2025-04-22'),
        return_date: null,
        status: 'BORROWED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[5],
        borrower_id: borrowerIds[5],
        checkout_date: new Date('2025-03-10'),
        due_date: new Date('2025-04-10'),
        return_date: new Date('2025-03-30'),
        status: 'RETURNED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[6],
        borrower_id: borrowerIds[6],
        checkout_date: new Date('2025-03-18'),
        due_date: new Date('2025-04-18'),
        return_date: null,
        status: 'BORROWED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[7],
        borrower_id: borrowerIds[7],
        checkout_date: new Date('2025-02-15'),
        due_date: new Date('2025-03-15'),
        return_date: null,
        status: 'OVERDUE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[8],
        borrower_id: borrowerIds[8],
        checkout_date: new Date('2025-03-25'),
        due_date: new Date('2025-04-25'),
        return_date: null,
        status: 'BORROWED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        book_id: bookIds[9],
        borrower_id: borrowerIds[9],
        checkout_date: new Date('2025-03-05'),
        due_date: new Date('2025-04-05'),
        return_date: new Date('2025-03-28'),
        status: 'RETURNED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return await queryInterface.bulkInsert('borrowing_transactions', transactions);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('borrowing_transactions', null, {});
  },
};
