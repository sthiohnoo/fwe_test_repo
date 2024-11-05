import express from 'express';
import listsRouter from './src/routes/shoppingLists.routes'; // Importiere den Router für die Listen
import { ENV } from './src/config/env.config';

const app = express();

console.log(ENV);

// Beispielroute
app.get('/', (_req, res) => {
    res.send('Willkommen zur Einkaufslisten-App! juhu');
});

// Füge den Listen-Router hinzu
app.use('/api/lists', listsRouter); // Hier fügst du die Listen-Routen hinzu

// Server starten
app.listen(ENV.PORT, () => {
    console.log(`Server läuft auf http://localhost:${ENV.PORT}`);
});
