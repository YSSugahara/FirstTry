var mongoose = require("mongoose");
conn2 = mongoose.createConnection('mongodb://localhost:27017/professor');
var Schema = mongoose.Schema;
var professor = new Schema({
    "turma": String,
    "nome": String
});
module.exports = conn2.model('professor', professor);
