import {deleteObject, getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
import {Request, Response, Router} from "express";
import multer from "multer";

const uploadImageController = Router();
const upload = multer({storage: multer.memoryStorage()}); // Multer en mémoire
const storage = getStorage();

uploadImageController.get("/", (req: Request, res: Response): void => {
    res.send("🚀 Welcome to the image upload API!");
});

uploadImageController.post("/image", upload.single('image'), async (req: Request, res: Response): Promise<void> => {
    try {
        const path = req.body.path;
        const file = req.file;

        if (!file) {
            res.status(400).send({error: "No file uploaded"});
            return;
        }

        const mimeType = file.mimetype || "image/jpeg"; // Assurer un type MIME correct
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.originalname}`;
        const imageRef = ref(storage, `${path}/${fileName}`);

        // Ajouter les métadonnées, notamment le type MIME
        const metadata = {
            contentType: mimeType,
        };

        // Upload direct du fichier
        await uploadBytes(imageRef, file.buffer, metadata);

        // Récupérer l'URL après un téléchargement réussi
        const downloadURL = await getDownloadURL(imageRef);
        console.log("URL de l'image téléchargée sur Firebase:", downloadURL);

        // Répondre avec l'URL de l'image
        res.status(200).send({url: downloadURL});
    } catch (error: any) {
        console.error('Erreur lors de l\'upload de l\'image :', error);
        res.status(500).send({error: error.message});
    }
});

uploadImageController.delete("/image", async (req: Request, res: Response): Promise<void> => {
    try {
        const path = req.body.path;
        const fileName = req.body.fileName;
        const imageRef = ref(storage, `${path}/${fileName}`);
        await deleteObject(imageRef);
        res.status(200).send({message: `Image ${fileName} supprimée avec succès`});
    } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'image :', error);
        res.status(500).send({error: error.message});
    }
});


export default uploadImageController;


