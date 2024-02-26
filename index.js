const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Perguntas = require("./database/Perguntas");
const Resposta = require("./database/Resposta");

connection
    .authenticate()
    .then(() =>{
        console.log("conexao bem sucedida com o banco de dados!")
    })
    .catch((msgErro) => console.log(msgErro));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    Perguntas.findAll({raw:true, order:[
        ['id','DESC']
    ]}).then(perguntas => {
        res.render("index", {
            perguntas: perguntas
        });
    })
})

app.get("/perguntar", (req, res)=>{
    res.render("perguntar");
})

app.post("/salvarpergunta", (req, res)=>{
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;

    Perguntas.create({
        titulo:titulo,
        descricao:descricao
    }).then(()=>{
        res.redirect("/");
    });
});

app.get("/pergunta/:id",(req, res)=>{
    const id = req.params.id;

    Perguntas.findOne({
        where:{id:id}
    }).then(pergunta => {
        if(pergunta != undefined){
            Resposta.findAll({
                where:{perguntaId:pergunta.id},
                order:[['id', 'DESC']]
            }).then(respostas =>{
                res.render("pergunta",{
                    pergunta:pergunta,
                    respostas:respostas
                })
            })
        }else{
            res.redirect("/");
        }
    })
})

app.post("/responder",(req, res)=>{
    const corpo = req.body.corpo;
    const perguntaId = req.body.pergunta;
    Resposta.create({
        corpo:corpo,
        perguntaId:perguntaId
    }).then(()=>{
        res.redirect(`/pergunta/${perguntaId}`);
    })
})

app.listen(4000, () => console.log("App running..."))