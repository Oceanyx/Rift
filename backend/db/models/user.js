'use strict';
const { Model } = require('sequelize');
const Validator = require('validator');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.Server, { foreignKey: 'owner_id', as: 'ownedServers' });
      User.hasMany(models.Message, { foreignKey: 'user_id' });
      User.belongsToMany(models.Server, { 
        through: models.ServerMember, 
        foreignKey: 'user_id',
        otherKey: 'server_id'
      });
    }

    toSafeObject() {
      const { id, firstName, lastName, username, email, avatar_url, status } = this;
      return { id, firstName, lastName, username, email, avatar_url, status };
    }
  }

  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        isNotEmail(value) {
          if (Validator.isEmail(value)) {
            throw new Error('Username cannot be an email.');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING.BINARY,
      allowNull: false,
      validate: {
        len: [60, 60]
      }
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'offline'
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: {
      attributes: {
        exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt']
      }
    },
    scopes: {
      currentUser: {
        attributes: { exclude: ['hashedPassword'] }
      },
      loginUser: {
        attributes: {}
      }
    }
  });

  return User;
};