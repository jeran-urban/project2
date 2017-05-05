// Dependencies
// =============================================================
var bcrypt = require("bcrypt-nodejs");
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
    // Creating a custom method for our User model. This will check if an unhashed password entered by
    // The user can be compared to the hashed password stored in our database
    timestamps: false,
    instanceMethods: {
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      }
    },
    // Hooks are automatic methods that run during various phases of the User Model lifecycle
    // In this case, before a User is created, we will automatically hash their password
    hooks: {
      beforeCreate: function(user, options, cb) {
        user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        cb(null, options);
      }
    }
  });
  User.sync();
  return User;
};

