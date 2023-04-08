import express, { response } from "express";
import cors from "cors";

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
app.get("/receitas", (request, response) => {
    const {filter} = request.query

    if(filter){
        const newList = receitas.filter(receita => receita.ingredientes.toLowerCase().includes(filter.toLowerCase()));
        return response.send(newList)
    }



    res.send(receitas)
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
    if(!request.body.nome, !request.body.ingredientes, !request.body.descricao){
        response.status(422).send("deu erro")
        return
    }
    const novaReceitas = 
        {
            id: receitas.length + 1,
            nome: request.body.nome,
            ingredientes: request.body.ingredientes,
            descricao: request.body.descricao
        }
    
    receitas.push(novaReceitas);

    response.sendStatus(201);
})

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999