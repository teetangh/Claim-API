const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Claim = sequelize.define('Claim', {
  payer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  procedure_codes: {
    type: DataTypes.ARRAY(DataTypes.ENUM('P1', 'P2', 'P3')),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'submitted',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = Claim;
