import express, { response } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"

const receitas = [
    {
        id: 1,
        nome: "pipoca",
        ingredientes: "milho",
        descricao: "só fritar"
    },
    {
        id: 2,
        nome: "paçoca",
        ingredientes: "mindurim",
        descricao: "só socar"
    }
]

const app = express() // app do server
app.use(cors());
app.use(express.json())
dotenv.config()

//teste de implementar relacionamento com banco de dados mongo
let db;
const mongoCLient = new MongoClient(process.env.DATABASE_URL)
mongoCLient.connect()
.then(() => db = mongoCLient.db())
.catch((erro) => console.log(erro.message))

// app.get("/herois", (request, response) => {
//     db.collection("herois").find().toArray()
//     .then((resposta) => response.send(resposta))
//     .catch((erro) => response.status(500).send(erro.message))
// })
//
app.get("/receitas", (request, response) => {
    // const {filter} = request.query
    // if(filter){
    //     const newList = receitas.filter(receita => receita.ingredientes.toLowerCase().includes(filter.toLowerCase()));
    //     return response.send(newList)
    // }
    // res.send(receitas)
    db.collection("receitas").find().toArray()
    .then(lst => response.send(lst) )
    .catch((erro) => response.send(erro.message).status(500))
})


app.get("/receitas/:id", (request, response) => {
    const {id} = request.params
    // exemplo simples para entender headers//
    const {auth} = request.headers;

    if(auth !== "Gabriel"){
        return response.status(401).send("Acesso negado");
    }


    const receita = receitas.find((item) => item.id === +id)

    if(!receita){
        response.status(404).send("Receita não encontrada")
    }

    response.send(receita)
})

app.post("/receitas", (request, response) => {
    // if(!request.body.nome, !request.body.ingredientes, !request.body.descricao){
    //     response.status(422).send("deu erro")
    //     return
    // }
    const novaReceitas = 
        {
            nome: request.body.nome,
            ingredientes: request.body.ingredientes,
            descricao: request.body.descricao
        }
    
        db.collection("receitas").insertOne(novaReceitas)
        .then(ok => response.send("Criado com sucesso").status(201))
        .catch(erro => response.send(erro.message).status(500))
})

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999