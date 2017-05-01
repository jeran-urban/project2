// Dependencies
// =============================================================

var Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
  var Movie = sequelize.define("movie", {
    movie: {
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE
    }
  }, {
    timestamps: false
  }
  );
  return Movie;
};