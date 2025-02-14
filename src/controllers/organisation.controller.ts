import {getStorage} from "firebase/storage";
import express, {Router} from "express";
import {addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {firestore} from "../utils/firebase_connect";
import uploadImageController from "./uploadImage.controller.ts";

const storage = getStorage();
const organisationController = Router();

organisationController.use(express.json());

organisationController.get("/", async (req, res) => {
    console.log(`* [ Connection ] Accessed Organisation Controller root`);
    res.send("Organisation Controller");
});
organisationController.get("/getByID", async (req, res) => {
    const organisationId = req.query.id as string;
    console.log(`* [ Action ] Fetching organisation with ID: ${organisationId}`);
    try {
        const organisationRef = doc(firestore, "organisations", organisationId);
        const organisationDoc = await getDoc(organisationRef);
        if (organisationDoc.exists()) {
            res.status(200).send(organisationDoc.data());
        } else {
            console.log("No such organisation!");
            res.status(404).send({error: "Organisation not found."});
        }
    } catch (e:any) {
        console.error("Error getting organisation:", e);
        res.status(500).send({error: e.message});
    }
});

organisationController.post("/create", async (req, res) => {
    const { name, adminUID } = req.body.organisationData;
    console.log(adminUID)
    try {
        // Check if an organization with the same name already exists
        const nameQuery = query(collection(firestore, "organisations"), where("name", "==", name));
        const nameQuerySnapshot = await getDocs(nameQuery);
        if (!nameQuerySnapshot.empty) {
            res.status(400).send({message: "Organisation existante"});
        }

        // Check if the admin is already assigned to another organization
        const adminQuery = query(collection(firestore, "organisations"), where("admin", "==", adminUID));
        const adminQuerySnapshot = await getDocs(adminQuery);
        if (!adminQuerySnapshot.empty) {
            res.status(400).send({message: "Admin déjà assigné à une autre organisation."});
        }

        // Create the new organization
        const docRef = await addDoc(collection(firestore, "organisations"), {
            name: name,
            adminUID: adminUID,
            isCompleted: false // Set isCompleted to false
        });
        console.log("Organisation créée avec succès ! ID: ", docRef.id);
        res.status(200).send({id: docRef.id});
    } catch (e) {
        console.error("Erreur lors de la création de l'organisation: ", e);
        res.status(500).send({error: "Erreur lors de la création de l'organisation."});
        throw e;
    }
})

organisationController.patch("/update", async (req, res) => {
    const { updateData, organisationId } = req.body;
    console.log(updateData);
    try {
        const organisationRef = doc(firestore, "organisations", organisationId);

        await updateDoc(organisationRef, {
            name: updateData.name,
            photoURL: updateData.photoURL,
            description: updateData.description,
            ageMin: updateData.ageMin,
            ageMax: updateData.ageMax,
            imageMapsLink: updateData.imageMapsLink,
            instagramLink: updateData.instagramLink,
            whatsappLink: updateData.whatsappLink,
            donationLink: updateData.donationLink,
            isCompleted: updateData.isCompleted
        });
        console.log("Organisation updated with ID: ", organisationRef.id);
        res.status(200).send({ message: "Organisation updated successfully" });
    } catch (e) {
        console.error("Error updating organisation: ", e);
        res.status(500).send({ error: "Error updating organisation." });
    }
});

export default organisationController;