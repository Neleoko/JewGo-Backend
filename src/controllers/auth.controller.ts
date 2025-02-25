import {Router} from "express";
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword} from 'firebase/auth';
import {firebaseAuth} from '../utils/firebase_connect';
import { signOut } from 'firebase/auth';


const AuthController = Router();

AuthController.get("/", async (req, res) => {
    console.log(`* [ Connection ] Accessed Auth Controller root`);
    res.send("Auth Controller");
});

AuthController.post("/login", async (req, res) => {

    try {
        const {email, password} = req.body;
        const response = await signInWithEmailAndPassword(firebaseAuth, email, password);
        console.log(`* [ Action ] User login`);

        if (response.user) {
            console.log("User logged in successfully");
            res.status(200).send(response);
        } else {
            console.log("User not found");
            res.status(404).send(response);
        }
    } catch (e: any) {
        console.error("Error logging in user: ", e);
        res.status(500).send({error: e.message});
    }
});

AuthController.post("/logout", async (req, res) => {
    try {
        await signOut(firebaseAuth);
        console.log(`* [ Action ] User logout`);
        res.status(200).send({ message: "User logged out successfully" });
    } catch (e: any) {
        console.error("Error logging out user: ", e);
        res.status(500).send({ error: e.message });
    }
});

AuthController.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        await createUserWithEmailAndPassword(firebaseAuth, email, password);

        console.log(`* [ Action ] User registration`);
        res.status(200).send("User registration");
    } catch (e: any) {
        console.error("Error registering user: ", e);
        res.status(400).send({ error: e.message });
    }
});

export default AuthController;