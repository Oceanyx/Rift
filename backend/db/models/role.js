'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // Define associations
      Role.belongsTo(models.Server, { foreignKey: 'server_id' });
      Role.belongsToMany(models.ServerMember, { 
        through: models.MemberRole,
        foreignKey: 'role_id',
        otherKey: 'member_id'
      });
    }
  }

  Role.init({
    server_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    permissions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Role',
    underscored: true
  });

  return Role;
};