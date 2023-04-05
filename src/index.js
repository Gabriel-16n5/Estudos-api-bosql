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
app.get("/receitas", (request, response) =>{

    response.send(receitas)
})

app.get("/receitas/:id", (request, response) => {
    const {id} = request.params

    const receita = receitas.find((item) => item.id === +id)

    response.send(receita)
})

app.post("/receitas", (req, res) => {
    console.log(req.body)
    const novaReceitas = [
        {
            id: receitas.length + 1,
            nome: req.body.nome,
            ingredientes: req.body.ingredientes,
            descricao: req.body.descricao
        }
    ]
    receitas.push(novaReceitas);

    res.send("receita adicionada");
})

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999