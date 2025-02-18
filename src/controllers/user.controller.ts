import {Router} from "express";
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {firestore} from "../utils/firebase_connect";

const userController = Router();

userController.get("/", async (req, res) => {
    console.log(`* [ Connection ] Accessed User Controller root`);
    res.send("User Controller");
});

userController.get("/getByUID", async (req, res) => {
    const userUid = req.query.uid as string;
    try {
        const userRef = doc(firestore, "users", userUid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            res.status(200).send(userDoc.data());
        } else {
            console.log("No such user!");
            res.status(404).send({error: "User not found."});
        }
    } catch (e: any) {
        console.error("Error getting user:", e);
        res.status(500).send({error: e.message});
    }
});

userController.post("/create", async (req, res) => {
    const userData = req.body.userData;
    try {
        await setDoc(doc(firestore, "users", userData.uid), userData);
        console.log("User created successfully: ", userData);
        res.status(200);
    } catch (e: any) {
        console.error("Error creating user: ", e);
        res.status(500).send({error: e.message});
    }
});

userController.patch("/update", async (req, res) => {
    const userData = req.body.userData;
    try {
        const userRef = doc(firestore, "users", userData.uid);
        await updateDoc(userRef, {
            organisation: {
                organisationID: userData.organisationID,
                role: userData.role
            }
        });
        res.status(200).send({message: "User updated successfully!"});
    } catch (e: any) {
        console.error("Error updating user: ", e);
        res.status(500).send({error: e.message});
    }
});
export default userController;