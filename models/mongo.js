var mongoose = require("mongoose");
conn9 = mongoose.createConnection('mongodb://localhost:27017/alunosDB1');
var Schema = mongoose.Schema;
var alunoSchema1 = new Schema({
    "ra": String,
    "nome": String,
    "curso": String
});
module.exports = conn9.model('alunos', alunoSchema1);
