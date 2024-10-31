import express from 'express';
import db from '../db/db';
// **Hier könntest du dein List Modell importieren, wenn es existiert**

const router = express.Router();

// Route, um alle Einkaufslisten abzurufen
router.get('/', async (req, res) => {
    // Hier würde später der Code stehen, um alle Listen abzurufen
    res.send('Hier könnten alle Einkaufslisten angezeigt werden.');
});

// Route, um eine neue Einkaufsliste zu erstellen
router.post('/', async (req, res) => {
    // Hier würde später der Code stehen, um eine neue Liste zu erstellen
    res.send('Hier könnte eine neue Einkaufsliste erstellt werden.');
});

export default router;
