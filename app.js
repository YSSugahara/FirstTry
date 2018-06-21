// Servidor da aplicacao

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Adicione "ponteiro" para o MongoDB
var mongoOp = require('./models/mongo');
var mongoOp2 = require('./models/mongo2');

// Ainda falta fazer esta parte
// var mongoAlunos = require('/models/alunos');
// var mongoProfessor = require('/models/professor');
// var mongoQuestoes = require('/models/questoes');

// Comente as duas linhas abaixo
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Serve static files
app.use('/', express.static(__dirname + '/'));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// adicione as duas linhas abaixo
var router = express.Router();
app.use('/', router);   // deve vir depois de app.use(bodyParser...

// comente as duas linhas abaixo
// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// codigo abaixo adicionado para o processamento das requisições
// HTTP GET, POST, PUT, DELETE

function checkAuth(req, res) {
  return true;
  cookies = req.cookies;
  var key = '';
  if(cookies) key = cookies.EA975;
  if(key == 'secret') return true;
  res.json({'Resultado': 'Clique em LOGIN para continuar'});
  return false;
}

// index.html
router.route('/')
 .get(function(req, res) {  // GET
   var path = 'index.html';
   res.header('Cache-Control', 'no-cache');
   res.sendfile(path, {"root": "./"});
   }
 );

router.route('/index')   // operacoes sobre todos os alunos
 .get(function(req, res) {  // GET (encontra)
     if(! checkAuth(req, res)) return;
     var response = {};
     mongoOp.find({}, function(erro, data) {
       if(erro)
          response = {"Resultado": "Falha de acesso ao Banco de Dados"};
        else
          response = {"Alunos": data};
          res.json(response);
        }
      )
    }
  )
  .post(function(req, res) {   // POST (cria)
     if(! checkAuth(req, res)) return;
     console.log(JSON.stringify(req.body));
     var query = {"ra": req.body.ra};
     var response = {};
     mongoOp.findOne(query, function(erro, data) {
        if (data == null) {
           var db = new mongoOp();
           db.ra = req.body.ra;
           db.nome = req.body.nome;
           db.curso = req.body.curso;
           db.save(function(erro) {
             if(erro) {
                 response = {"Resultado": "Falha de insercao no Banco de Dados"};
                 res.json(response);
             } else {
                 response = {"Resultado": "Aluno inserido no Banco de Dados"};
                 res.json(response);
              }
            }
          )
        } else {
      response = {"Resultado": "Aluno ja existente"};
            res.json(response);
          }
        }
      )
    }
  );


router.route('/index/:ra')   // operacoes sobre um aluno (RA)
  .get(function(req, res) {   // GET
     if(! checkAuth(req, res)) return;
      var response = {};
      var query = {"ra": req.params.ra};
      mongoOp.findOne(query, function(erro, data) {
         if(erro) {
            response = {"Resultado": "Falha de acesso ao Banco de Dados"};
            res.json(response);
         } else if (data == null) {
             response = {"Resultado": "Aluno inexistente"};
             res.json(response);
   } else {
      response = {"alunos": [data]};
            res.json(response);
           }
        }
      )
    }
  )
  .put(function(req, res) {   // PUT (altera)
      if(! checkAuth(req, res)) return;
      var response = {};
      var query = {"ra": req.params.ra};
      var data = {"nome": req.body.nome, "curso": req.body.curso};
      mongoOp.findOneAndUpdate(query, data, function(erro, data) {
          if(erro) {
            response = {"Resultado": "Falha de acesso ao DB"};
            res.json(response);
    } else if (data == null) {
             response = {"Resultado": "Aluno inexistente"};
             res.json(response);
          } else {
             response = {"Resultado": "Aluno atualizado no Banco de Dados"};
             res.json(response);
    }
        }
      )
    }
  )
  .delete(function(req, res) {   // DELETE (remove)
     if(! checkAuth(req, res)) return;
     var response = {};
     var query = {"ra": req.params.ra};
      mongoOp.findOneAndRemove(query, function(erro, data) {
         if(erro) {
            response = {"Resultado": "Falha de acesso ao DataBase"};
            res.json(response);
   } else if (data == null) {
             response = {"Resultado": "Aluno inexistente"};
             res.json(response);
            } else {
              response = {"Resultado": "Aluno removido do Banco de Dados"};
              res.json(response);
     }
         }
       )
     }
);


router.route('/authentication')   // autenticação
  .get(function(req, res) {  // GET
     var path = 'auth.html';
     res.header('Cache-Control', 'no-cache');
     res.sendfile(path, {"root": "./"});
     }
  )
  .post(function(req, res) {
     console.log(JSON.stringify(req.body));
     var user = req.body.user;
     var pass = req.body.pass;
     // verifica usuario e senha na base de dados
     if(user == 'eleri' && pass == 'cardozo') {
    res.cookie('EA975', 'secret', {'maxAge': 3600000*24*5});
    res.status(200).send('');  // OK
      } else {
    res.status(401).send('');   // unauthorized
      }
    }
  )
  .delete(function(req, res) {
     res.clearCookie('EA975');   // remove cookie no cliente
     res.json({'Resultado': 'Sucesso'});
     }
);

// professor.html
router.route('/professor')   // operacoes sobre todos os professores
 .get(function(req, res) {  // GET
     if(! checkAuth(req, res)) return;
     var response = {};
     mongoOp.find({}, function(erro, data) {
       if(erro)
          response = {"Resultado": "Falha de acesso ao Banco de Dados"};
        else
          response = {"Professor": data};
          res.json(response);
        }
      )
    }
  )
  .post(function(req, res) {   // POST (cria)
     if(! checkAuth(req, res)) return;
     console.log(JSON.stringify(req.body));
     var query = {"nome": req.body.nome};
     var response = {};
     mongoOp.findOne(query, function(erro, query) {
        if (query == null) {
           var db = new mongoOp();
           db.nome = req.body.nome;
           db.turma = req.body.turma;
           db.save(function(erro) {
             if(erro) {
                 response = {"Resultado": "Falha de insercao no Banco de Dados"};
                 res.json(response);
             } else {
                 response = {"Resultado": "Professor inserido no Banco de Dados"};
                 res.json(response);
              }
            }
          )
        } else {
      response = {"Resultado": "Professor ja existente"};
            res.json(response);
          }
        }
      )
    }
  );


router.route('/professor/:nome')   // operacoes sobre um professor (nome)
  .get(function(req, res) {   // GET
     if(! checkAuth(req, res)) return;
      var response = {};
      var query = {"nome": req.params.nome};
      var data = {"turma": req.body.turma};
      mongoOp.findOneAndUpdate(query, data, function(erro, data) {
         if(erro) {
            response = {"Resultado": "Falha de acesso ao Banco de Dados"};
            res.json(response);
         } else if (data == null) {
             response = {"Resultado": "Professor inexistente"};
             res.json(response);
   } else {
      response = {"Professor": [data]};
            res.json(response);
           }
        }
      )
    }
  )
  .put(function(req, res) {   // PUT (altera)
      if(! checkAuth(req, res)) return;
      var response = {};
      var query = {"nome": req.params.nome};
      var data = {"turma": req.body.turma};
      mongoOp.findOneAndUpdate(query, data, function(erro, data) {
          if(erro) {
            response = {"Resultado": "Falha de acesso ao Data Base"};
            res.json(response);
    } else if (data == null) {
             response = {"Resultado": "Professor inexistente"};
             res.json(response);
          } else {
             response = {"Resultado": "Professor atualizado no Banco de Dados"};
             res.json(response);
    }
        }
      )
    }
  )
  .delete(function(req, res) {   // DELETE (remove)
     if(! checkAuth(req, res)) return;
     var response = {};
     var query = {"nome": req.params.nome};
      mongoOp.findOneAndRemove(query, function(erro, data) {
         if(erro) {
            response = {"Resultado": "Falha de acesso ao Data Base"};
            res.json(response);
   } else if (data == null) {
             response = {"Resultado": "Professor inexistente"};
             res.json(response);
            } else {
              response = {"Resultado": "Professor removido do Banco de Dados"};
              res.json(response);
     }
         }
       )
     }
);

//alunos.html
router.route('/alunos')   // operacoes sobre todos os alunos
 .get(function(req, res) {  // GET (encontra)
     if(! checkAuth(req, res)) return;
     var response = {};
     mongoOp.find({}, function(erro, data) {
       if(erro)
          response = {"Resultado": "Falha de acesso ao Banco de Dados"};
        else
          response = {"Alunos": data};
          res.json(response);
        }
      )
    }
  )
  .post(function(req, res) {   // POST (cria)
     if(! checkAuth(req, res)) return;
     console.log(JSON.stringify(req.body));
     var query = {"ra": req.body.ra};
     var response = {};
     mongoOp.findOne(query, function(erro, data) {
        if (data == null) {
           var db = new mongoOp();
           db.ra = req.body.ra;
           db.nome = req.body.nome;
           db.turma = req.body.turma;
           db.save(function(erro) {
             if(erro) {
                 response = {"Resultado": "Falha de insercao no Banco de Dados"};
                 res.json(response);
             } else {
                 response = {"Resultado": "Aluno inserido no Banco de Dados"};
                 res.json(response);
              }
            }
          )
        } else {
      response = {"Resultado": "Aluno ja existente"};
            res.json(response);
          }
        }
      )
    }
  );


router.route('/alunos/:ra')   // operacoes sobre um aluno (RA)
  .get(function(req, res) {   // GET
     if(! checkAuth(req, res)) return;
      var response = {};
      var query = {"ra": req.params.ra};
      mongoOp.findOne(query, function(erro, data) {
         if(erro) {
            response = {"Resultado": "Falha de acesso ao Banco de Dados"};
            res.json(response);
         } else if (data == null) {
             response = {"Resultado": "Aluno inexistente"};
             res.json(response);
   } else {
      response = {"alunos": [data]};
            res.json(response);
           }
        }
      )
    }
  )
  .put(function(req, res) {   // PUT (altera)
      if(! checkAuth(req, res)) return;
      var response = {};
      var query = {"ra": req.params.ra};
      var data = {"nome": req.body.nome, "turma": req.body.turma};
      mongoOp.findOneAndUpdate(query, data, function(erro, data) {
          if(erro) {
            response = {"Resultado": "Falha de acesso ao DB"};
            res.json(response);
    } else if (data == null) {
             response = {"Resultado": "Aluno inexistente"};
             res.json(response);
          } else {
             response = {"Resultado": "Aluno atualizado no Banco de Dados"};
             res.json(response);
    }
        }
      )
    }
  )
  .delete(function(req, res) {   // DELETE (remove)
     if(! checkAuth(req, res)) return;
     var response = {};
     var query = {"ra": req.params.ra};
      mongoOp.findOneAndRemove(query, function(erro, data) {
         if(erro) {
            response = {"Resultado": "Falha de acesso ao DataBase"};
            res.json(response);
   } else if (data == null) {
             response = {"Resultado": "Aluno inexistente"};
             res.json(response);
            } else {
              response = {"Resultado": "Aluno removido do Banco de Dados"};
              res.json(response);
     }
         }
       )
     }
);
