var mongoose = require('mongoose');  

var blobSchema = new mongoose.Schema({  
  title: String,
  organiser: String,
  date: { type: Date, default: Date.now },
  description: String,
  ticketprice: Number
});

module.exports = mongoose.model('Blob', blobSchema);
