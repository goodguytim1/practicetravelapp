const mongoose = require('mongoose')
var travellerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  trips: [Object]
});


const Map  = mongoose.model("traveller", travellerSchema);
module.exports = Map;