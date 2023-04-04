import express, { response } from "express";

const app = express() // app do server

app.get("/home", (request, response) =>{
    response.send("ta em casa")
})

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999