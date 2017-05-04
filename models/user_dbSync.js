// Dependencies
// =============================================================

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  
  var User = sequelize.define("user", {
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    likes: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1]
      }
    },
    dislikes: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1]
      }
    }
  }, {
      timestamps: false
     }
  );
  User.sync();
  return User;
};