import express, { response } from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv"


const app = express() // app do server
app.use(cors());
app.use(express.json())
dotenv.config()


let db;
const mongoCLient = new MongoClient(process.env.DATABASE_URL)
mongoCLient.connect()
.then(() => db = mongoCLient.db())
.catch((erro) => console.log(erro.message))

app.get("/receitas", (request, response) => {
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