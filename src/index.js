import express, { response } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv"


const app = express() // Criação do app do server

// configuração do servidor
app.use(cors());
app.use(express.json())
dotenv.config()

// conexão com o db
const mongoCLient = new MongoClient(process.env.DATABASE_URL)
    try{
        await mongoCLient.connect()
        console.log("conexão com db feita")
    }catch (erro) {
        console.log(erro.message)
    }
const db = mongoCLient.db();


// end points da aplicação

app.get("/receitas", async (request, response) => {
    try{
       const receitas = await db.collection("receitas").find().toArray();
        response.status(200).send(receitas)
    } catch (erro) {
        res.status(500).send(erro.message)
    }
})


app.get("/receitas/:id", async (request, response) => {
    const {id} = request.params

    try{
        const result = await db.collection("receitas").findOne({ _id: new ObjectId(id) });
        if(!result) {
            return response.status(404).send("Receita não encontrada")
        }
        response.send(result)
    } catch (erro) {
        response.status(500).send(erro.message)
    }

})

app.post("/receitas", async (request, response) => {
    const {nome, ingredientes, descricao} = request.body;
    const novaReceitas = {}
    if(nome) novaReceitas.nome = nome;
    if(ingredientes) novaReceitas.ingredientes = ingredientes;
    if(descricao) novaReceitas.descricao = descricao;
    
    try{
        const recipe = await db.collection("receitas").findOne({nome: nome})
        if(recipe) return response.status(409).send("receita já existente")

        await db.collection("receitas").insertOne(novaReceitas)
        response.status(201).send("Receita criada com sucesso")
    } catch (erro) {
        response.status(500).send(erro.message)
    }
})

app.delete("/receitas/:id", async (request, response) => {
    const {id} = request.params;
    try{
       const result = await db.collection("receitas").deleteOne({_id: new ObjectId(id)});
       if(result.deletedCount === 0) return response.status(404).send("Item não encontrado")
        response.status(200).send("deletado")
    }

    catch (erro) {
        response.status(500).send("deu ruim")
    }
})

app.delete("/receitas/muitas/:filtroIngredientes", async (request, response) => {
    const {filtroIngredientes} = request.params;
    try{
       const result = await db.collection("receitas").deleteMany({ ingredientes: filtroIngredientes});
       if (result.deletedCount === 0) return response.status(404).send("Não existe nem uma receita com esse ingrediente")
        response.status(200).send("deletado")
    }

    catch (erro) {
        response.status(500).send("deu ruim")
    }
})

app.put("/receitas/:id", async (request, response) => {
    const {id} = request.params;
    const {nome, ingredientes, descricao} = request.body;

    const receitaEditada = {}
    if(nome) receitaEditada.nome = nome;
    if(ingredientes) receitaEditada.ingredientes = ingredientes;
    if(descricao) receitaEditada.descricao = descricao;

    try{
        const result = await db.collection("receitas").updateOne(
            { _id: new ObjectId(id) },
            { $set: receitaEditada}
        )
        if(result.matchedCount === 0) response.status(404).send("esse item não existe")
        response.send("receita atualizada")
    }
    catch (erro) {
        response.status(500).send("deu ruim")
    }
})

app.put("/receitas/muitas/:filtroIngredientes", async (request, response) => {
    const {filtroIngredientes} = request.params;
    const {nome, ingredientes, descricao} = request.body;

    const receitaEditada = {}
    if(nome) receitaEditada.nome = nome;
    if(ingredientes) receitaEditada.ingredientes = ingredientes;
    if(descricao) receitaEditada.descricao = descricao;

    try{
        const result = await db.collection("receitas").updateMany(
            {ingredientes: {$regex: filtroIngredientes, $options: "i"}},
            {$set: receitaEditada}
        )

        if(result.matchedCount === 0) return response.status(404).send("deu ruim")
            
            response.send("receitas editadas")

    } catch (erro) {
        response.status(500).send(erro.message)
    }
})

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999