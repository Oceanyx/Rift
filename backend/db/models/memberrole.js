'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MemberRole extends Model {
    static associate(models) {
      // Associations
      MemberRole.belongsTo(models.ServerMember, {
        foreignKey: 'member_id',
        as: 'member'
      });
      
      MemberRole.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role'
      });
    }
  }
  
  MemberRole.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'server_members',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'MemberRole',
    tableName: 'member_roles',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['member_id', 'role_id']
      }
    ]
  });
  
  return MemberRole;
};