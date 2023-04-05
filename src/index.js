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
app.get("/receitas", (request, response) =>{

    response.send(receitas)
})

app.get("/receitas/:id", (request, response) => {
    const {id} = request.params

    const receita = receitas.find((item) => item.id === +id)

    response.send(receita)
})

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999