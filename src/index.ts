import express from "express";
import CategorieController from "./controllers/categorie.controller.ts";
import config from "../environnements.config.ts"


const app = express();
const port: string = config.PORT|| "8080";

app.use(express.json());
app.set('json spaces', 2);
// ------------------ Importation des modules ------------------
const router = express.Router();

// ------------------ Routes ------------------
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/categorie", CategorieController);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`http://localhost:${port}`);
});