import express, { response } from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv"
import joi from "joi"
import bcrypt from "bcrypt"

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

//schmas

const userSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().required()
})


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
        if(!result) {return response.status(404).send("Receita não encontrada")}
        response.send(result)
    } catch (erro) {
        response.status(500).send(erro.message)
    }

})

app.post("/receitas", async (request, response) => {
    const {nome, ingredientes, descricao} = request.body;
    
    const receitaSchema = joi.object({
        nome: joi.string().required(),
        ingredientes: joi.string().required(),
        descricao: joi.string().required()
    })

    const validation = receitaSchema.validate(request.body, {abortEarly: false});

    if(validation.error) return response.status(422).send(validation.error.details);

    try{
        const recipe = await db.collection("receitas").findOne({nome: nome})
        if(recipe) return response.status(409).send("receita já existente")

        await db.collection("receitas").insertOne(request.body)
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
       const result = await db.collection("receitas").deleteMany({ingredientes: {$regex: filtroIngredientes, $options: "i"}});
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

    const receitaSchema = joi.object({
        nome: joi.string(),
        ingredientes: joi.string(),
        descricao: joi.string()
    })

    const validation = receitaSchema.validate(request.body, {abortEarly: false});

    if(validation.error) return response.status(422).send(validation.error.details);

    try{
        const result = await db.collection("receitas").updateOne(
            { _id: new ObjectId(id) },
            { $set: request.body}
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

    const receitaSchema = joi.object({
        nome: joi.string(),
        ingredientes: joi.string(),
        descricao: joi.string()
    })

    const validation = receitaSchema.validate(request.body, {abortEarly: false});

    if(validation.error) return response.status(422).send(validation.error.details);

    try{
        const result = await db.collection("receitas").updateMany(
            {ingredientes: {$regex: filtroIngredientes, $options: "i"}},
            {$set: request}
        )

        if(result.matchedCount === 0) return response.status(404).send("deu ruim")
            
            response.send("receitas editadas")

    } catch (erro) {
        response.status(500).send(erro.message)
    }
})

    app.post("/sign-up", async (req, res) => {
        const {nome, email, senha} = req.body;

        const validation = userSchema.validate(req.body, {abortEarly: false});
        if(validation.error) return res.status(422).send(validation.error.details);

        const hash = (bcrypt.hashSync(senha, 10))

        try{
            const userEmail = await db.collection("users").findOne({email});
            if(userEmail) return res.status(401).send("email já cadastrado");
            await db.collection("users").insertOne({nome, email, senha: hash})
            res.sendStatus(201);
        } catch(erro) {
            response.status(500).send(erro.message)
        }
    })

    app.post("/sign-in", async (req, res) => {
        const {email, senha} = req.body;

        try{
            const holder = await db.collection("users").findOne({email})
            if(!holder) return res.status(401).send("email não cadastrado");

            const passCompare = bcrypt.compareSync(senha, holder.senha);
            if(!passCompare) return res.status(401).send("senha incorreta");

            res.sendStatus(200)
        } catch(erro) {
            response.status(500).send(erro.message)
        }
    })

app.listen(4000, () => console.log("Ta rodando")) // normalmente não é porta fixa, geralmente de 3000 a 5999