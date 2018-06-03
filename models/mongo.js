var mongoose = require("mongoose");
conn1 = mongoose.createConnection('mongodb://localhost:27017/alunosDB');
var Schema = mongoose.Schema;
var alunoSchema = new Schema({
    "ra": String,
    "nome": String,
    "curso": String
});
module.exports = conn1.model('alunos', alunoSchema);
