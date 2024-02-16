const mongoose = require('mongoose')

const doSchema = new mongoose.Schema({
 
  date: {type: String},
  time: {type: String},
  team: {type: String},
  rcpName: {type: String},  
  batchNo: {type: String},
  siloNo: { type: String },
  matName: {type: String},  
  targWt : {type :String}, 
  actWt : {type :String},
  diffWt : {type :String},
   
  customer: { 
    type: mongoose.Schema.Types.ObjectId,    
    ref: 'customer'
  },
})


module.exports = mongoose.model('M16', doSchema)