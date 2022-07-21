const mongoose = require('mongoose')
var agentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  clients: [Object]
});


const Map  = mongoose.model("agent", agentSchema);
module.exports = Map;