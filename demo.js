const mongoose = require('mongoose');
const mongoose2 = new mongoose.Mongoose();


var conn = mongoose.connect('mongodb://localhost/db1', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

var conn2 = mongoose2.connect('mongodb://localhost/db2', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
});


var Schema = new mongoose.Schema({})
var model1 = conn.model('User', Schema);
var model2 = conn2.model('Item', Schema);
model1.find({}, function () {
    console.log("this will print out last");
});
model2.find({}, function () {
    console.log("this will print out first");
});