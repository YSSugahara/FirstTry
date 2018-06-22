var mongoose = require("mongoose");
conn3 = mongoose.createConnection('mongodb://localhost:27017/questoes');
var Schema = mongoose.Schema;
var questoesSchema = new Schema({
    "gabarito": Array
});
module.exports = conn3.model('questoes', questoesSchema);
