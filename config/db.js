const mongoose = require('mongoose');
const keys = require('./key');

// Map global promises
mongoose.Promise = global.Promise;
// Mongoose Connect
mongoose
  .connect('mongodb://max:max123@ds263500.mlab.com:63500/votepoll')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
