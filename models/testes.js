var mongoose = require("mongoose");
conn4 = mongoose.createConnection('mongodb://localhost:27017/testes');
var Schema = mongoose.Schema;
var testesSchema = new Schema({
    "id": String,
    "ra": String,
    "nome":String,
    "resposta": Array
});
module.exports = conn4.model('teste', testesSchema);
