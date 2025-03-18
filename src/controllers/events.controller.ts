import express, {Router} from "express";
import {firestore} from "../utils/firebase_connect";
import {addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, where, writeBatch} from "firebase/firestore";
import {deleteObject, getStorage, ref} from 'firebase/storage';
import {DocumentData} from "firebase/firestore";

const storage = getStorage();
const eventsController = Router();

eventsController.use(express.json()); // Ensure JSON body parsing

eventsController.get("/", async (req, res) => {
    console.log(`* [ Connection ] Accessed Events Controller root`);
    res.send("Events Controller");
});

eventsController.get("/getAll", async (req, res) => {
    console.log(`* [ Action ] Fetching all events`);
    try {
        const dateEventsCollection = collection(firestore, "dateEvents");
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Format AAAA-MM-JJ
        console.log(`* [ Info ] Today's date: ${todayString}`);
        const dateEventsQuery = query(dateEventsCollection, orderBy("date"), where("date", ">=", todayString));
        const dateEventsSnapshot = await getDocs(dateEventsQuery);
        const eventsData = [];
        for (const dateDoc of dateEventsSnapshot.docs) {
            const date = dateDoc.data().date;
            console.log(`* [ Processing ] Date: ${date}`);
            const eventsCollection = collection(dateDoc.ref, "events");
            const eventsSnapshot = await getDocs(eventsCollection);
            const events: DocumentData[] = [];
            eventsSnapshot.forEach((eventDoc) => {
                const eventData = eventDoc.data();
                eventData.id = eventDoc.id; // Add the event ID to the event data
                events.push(eventData);
                console.log(`* [ Found ] Event ID: ${eventData.id}`);
            });
            eventsData.push({date: date, events: events});
        }
        res.status(200).send(eventsData);
        console.log(`✅ [ Success ] Fetched all events successfully`);
    } catch (e: any) {
        console.error(`❌ [ Error ] Fetching events: ${e.message}`);
        res.status(500).send({error: e.message});
    }
});

eventsController.get("/getEventByDateAndID", async (req, res) => {
    const date = req.query.date as string;
    const eventId = req.query.id as string;
    console.log(`* [ Action ] Fetching event with date: ${date} and ID: ${eventId}`);
    const dateEventsCollection = collection(firestore, "dateEvents");

    const dateQuery = query(dateEventsCollection, where("date", "==", date));
    const dateSnapshot = await getDocs(dateQuery);
    if (!dateSnapshot.empty) {
        const dateDoc = dateSnapshot.docs[0];
        const eventsCollection = collection(dateDoc.ref, "events");
        const eventDocRef = doc(eventsCollection, eventId);
        const eventDoc = await getDoc(eventDocRef);
        if (eventDoc.exists()) {
            const eventData = eventDoc.data();
            res.status(200).send(eventData);
            console.log(`✅ [ Success ] Fetched event successfully`);
        } else {
            console.log(`❌ [ Not Found ] No such event`);
            res.status(404).send("No such event!");
        }
    } else {
        console.log(`❌ [ Not Found ] No such date`);
        res.status(404).send("No such date!");
    }
});

eventsController.get("/getEventsByOrganisation", async (req, res) => {
    const organisationId = req.query.organisationId as string;
    console.log(`* [ Action ] Fetching events for organisation with ID: ${organisationId}`);

    try {
        const dateEventsCollection = collection(firestore, "dateEvents");
        const dateEventsQuery = query(dateEventsCollection, orderBy("date", 'desc'));
        const dateEventsSnapshot = await getDocs(dateEventsQuery);

        const eventsData = [];

        // Boucle à travers les documents de dates d'événements
        for (const dateDoc of dateEventsSnapshot.docs) {
            const date = dateDoc.data().date;
            const eventsCollection = collection(dateDoc.ref, "events");

            // Modifie la requête des événements pour inclure un filtre sur l'organisation
            const eventsQuery = query(eventsCollection, where("organisationID", "==", organisationId)); // Filtrage par organisationId
            const eventsSnapshot = await getDocs(eventsQuery);
            const events: DocumentData[] = [];
            eventsSnapshot.forEach((eventDoc) => {
                const eventData = eventDoc.data();
                eventData.id = eventDoc.id; // Ajouter l'ID de l'événement aux données de l'événement
                events.push(eventData);
            });

            // Si des événements existent pour cette date, les ajouter à la réponse
            if (events.length > 0) {
                eventsData.push({date: date, events: events});
            }
        }

        res.status(200).send(eventsData);
        console.log(`✅ [ Success ] Fetched events for organisation successfully`);
    } catch (e: any) {
        console.error(`❌ [ Error ] Fetching events for organisation: ${e.message}`);
        res.status(500).send({error: e.message});
    }
});


eventsController.post("/addEvent", async (req, res) => {
    const {date, event} = req.body;
    console.log(`* [ Action ] Adding event on date: ${date}`);
    try {
        const dateEventsCollection = collection(firestore, "dateEvents");
        const eventsQuery = query(dateEventsCollection, where("date", "==", date));
        const querySnapshot = await getDocs(eventsQuery);
        let dateDoc;

        if (querySnapshot.empty) {
            console.log(`* [ Info ] No document found for the date, creating a new one`);
            dateDoc = await addDoc(dateEventsCollection, {date: date});
        } else {
            console.log(`* [ Info ] Document found for the date`);
            dateDoc = querySnapshot.docs[0].ref;
        }

        const eventsCollection = collection(dateDoc, "events");
        const eventDocRef = await addDoc(eventsCollection, event);
        console.log(`✅ [ Success ] Event added with ID: ${eventDocRef.id}`);
        res.status(201).send({id: eventDocRef.id, date: date});
    } catch (e: any) {
        console.error(`❌ [ Error ] Adding event: ${e.message}`);
        res.status(500).send({error: e.message});
    }
});

eventsController.patch("/updateEvent", async (req, res) => {
    const {date, id, event} = req.body;
    console.log(`* [ Action ] Updating event with ID: ${id} on date: ${date}`);
    try {
        const dateEventsCollection = collection(firestore, "dateEvents");
        const dateQuery = query(dateEventsCollection, where("date", "==", date));
        const dateSnapshot = await getDocs(dateQuery);

        if (!dateSnapshot.empty) {
            const dateDoc = dateSnapshot.docs[0];
            const eventsCollection = collection(dateDoc.ref, "events");
            const eventDocRef = doc(eventsCollection, id);
            await setDoc(eventDocRef, event, {merge: true});
            console.log(`✅ [ Success ] Event updated successfully`);
            res.status(200).send({message: "Event updated successfully!", date: date, id: id});
        } else {
            console.log(`❌ [ Not Found ] No such date`);
            res.status(404).send("No such date!");
        }
    } catch (e: any) {
        console.error(`❌ [ Error ] Updating event: ${e.message}`);
        res.status(500).send({error: e.message});
    }
})

eventsController.delete("/deleteEvent", async (req, res) => {

    try {
        const eventId = req.query.id as string;
        console.log(`* [ Action ] Deleting event with ID: ${eventId}`);
        const dateEventsCollection = collection(firestore, "dateEvents");

        const dateEventsSnapshot = await getDocs(dateEventsCollection);
        let eventFound = false;

        for (const dateDoc of dateEventsSnapshot.docs) {
            const eventsCollection = collection(dateDoc.ref, "events");
            const eventDocRef = doc(eventsCollection, eventId);
            const eventDoc = await getDoc(eventDocRef);

            if (eventDoc.exists()) {
                eventFound = true;
                const eventData = eventDoc.data();
                const imageUrl = eventData.image;
                const mapsImageUrl = eventData.imageMapsLink;
                console.log(`* [ Data ] Event data: ${JSON.stringify(eventData)}`);

                if (imageUrl) {
                    const imageRef = ref(storage, imageUrl);
                    await deleteObject(imageRef);
                    console.log(`✅ [ Success ] Deleted image from storage: ${imageUrl}`);
                }
                if (mapsImageUrl) {
                    const mapsImageRef = ref(storage, mapsImageUrl);
                    await deleteObject(mapsImageRef);
                    console.log(`✅ [ Success ] Deleted maps image from storage: ${mapsImageUrl}`);
                }

                const batch = writeBatch(firestore);
                batch.delete(eventDocRef);

                const remainingEventsSnapshot = await getDocs(eventsCollection);
                if (remainingEventsSnapshot.size === 1) {
                    batch.delete(dateDoc.ref);
                    console.log(`* [ Info ] Deleted date document as no events are left`);
                }

                await batch.commit();
                console.log(`✅ [ Success ] Event deleted successfully`);
                res.status(200).send("Event deleted successfully!");
            }
        }

        if (!eventFound) {
            console.log(`❌ [ Not Found ] No such event`);
            res.status(404).send("No such event!");
        }
    } catch (error: any) {
        console.error(`❌ [ Error ] Deleting event: ${error.message}`);
        res.status(500).send({error: error.message});
    }
});
export default eventsController;