import { Router } from "express";
import config from "../../environnements.config.ts";
import axios from "axios";

const googleController = Router();

googleController.get("/", async (req, res) => {
    res.send("Google Controller");
});

googleController.get("/createMapsImage", async (req, res) => {
    const address = req.query.address as string;

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';

    const params: Record<string, string> = {
        center: address,
        zoom: '15',
        size: '600x300',
        maptype: 'roadmap',
        markers: `color:red|label:|${address}`,
        key: config.GOOGLE_API_KEY || '',
        icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
    };

    try {
        res.status(200).send(`${baseUrl}?${new URLSearchParams(params).toString()}`);
    } catch (e: any) {
        res.status(500).send({ error: e.message });
    }
});

googleController.get("/verifyAddress", async (req, res) => {
    const address = req.query.address as string;
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: config.GOOGLE_API_KEY
            }
        });
        // Check if the response contains any results
        if (response.data.status === 'OK' && response.data.results.length > 0) {
            console.log('Address is valid');
            res.status(200).send({ valid: true });
        } else {
            console.log('Address is invalid');
            res.status(400).send({ valid: false });
        }
    } catch (e: any) {
        console.error('Error validating address:', e);
        res.status(500).send({ error: e.message });
    }
});
export default googleController;