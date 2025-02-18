import express from "express";
import CategorieController from "./controllers/categorie.controller.ts";
import config from "../environnements.config.ts"
import EventsController from "./controllers/events.controller.ts";
import UploadImageController from "./controllers/Image.controller.ts";
import OrganisationController from "./controllers/organisation.controller.ts";
import UserController from "./controllers/user.controller.ts";
import AuthController from "./controllers/auth.controller.ts";
import GoogleController from "./controllers/google.controller.ts";

const app = express();
const port: string = config.PORT || "8080";

app.use(express.json());
app.set('json spaces', 2);
// ------------------ Importation des modules ------------------
express.Router();

// ------------------ Routes ------------------
app.get("/", (req, res) => {
    res.send("Hello World");
});

app.use("/auth", AuthController);
app.use("/categorie", CategorieController);
app.use("/event", EventsController);
app.use("/organisation", OrganisationController);
app.use("/user", UserController);
app.use("/upload", UploadImageController);
app.use("/google", GoogleController);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});