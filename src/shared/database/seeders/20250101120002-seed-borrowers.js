'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { v4: uuidv4 } = require('uuid');

    const borrowers = [
      {
        id: uuidv4(),
        name: 'Ahmed Hassan',
        email: 'ahmed.hassan@example.com',
        phone: '+20 100 123 4567',
        registered_date: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Fatima Mohamed',
        email: 'fatima.mohamed@example.com',
        phone: '+20 101 234 5678',
        registered_date: new Date('2025-01-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Omar Khalid',
        email: 'omar.khalid@example.com',
        phone: '+20 102 345 6789',
        registered_date: new Date('2025-02-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Layla Ibrahim',
        email: 'layla.ibrahim@example.com',
        phone: '+20 103 456 7890',
        registered_date: new Date('2025-02-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Khaled Ali',
        email: 'khaled.ali@example.com',
        phone: '+20 104 567 8901',
        registered_date: new Date('2025-02-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Noor Samir',
        email: 'noor.samir@example.com',
        phone: '+20 105 678 9012',
        registered_date: new Date('2025-02-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Amira Mahmoud',
        email: 'amira.mahmoud@example.com',
        phone: '+20 106 789 0123',
        registered_date: new Date('2025-02-25'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Hassan Youssef',
        email: 'hassan.youssef@example.com',
        phone: '+20 107 890 1234',
        registered_date: new Date('2025-03-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Sara Ahmed',
        email: 'sara.ahmed@example.com',
        phone: '+20 108 901 2345',
        registered_date: new Date('2025-03-05'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'Mohamed Karim',
        email: 'mohamed.karim@example.com',
        phone: '+20 109 012 3456',
        registered_date: new Date('2025-03-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return await queryInterface.bulkInsert('borrowers', borrowers);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete('borrowers', null, {});
  },
};
