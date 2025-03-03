'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ServerMember extends Model {
    static associate(models) {
      // Define associations
      ServerMember.belongsTo(models.Server, { foreignKey: 'server_id' });
      ServerMember.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  ServerMember.init({
    server_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ServerMember',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['server_id', 'user_id']
      }
    ]
  });

  return ServerMember;
};