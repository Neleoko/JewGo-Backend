import {collection, getDocs, query} from "firebase/firestore";
import {firestore} from "../utils/firebase_connect";
import {Router} from "express";


const CategoriesController = Router();

CategoriesController.get("/", async (req, res) => {
    res.send("Categories Controller");
});
CategoriesController.get("/getAll", async (req, res) => {
    try {
        const categoriesCollection = collection(firestore, "categories");
        const categoriesQuery = query(categoriesCollection);
        const querySnapshot = await getDocs(categoriesQuery);
        const categories = querySnapshot.docs.map(doc => doc.data());
        res.status(200).send(categories);
    } catch (e: any) {
        res.status(500).send({error: e.message});
    }
});
export default CategoriesController;