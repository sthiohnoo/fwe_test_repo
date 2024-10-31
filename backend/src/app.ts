import express from 'express';
import listsRouter from './routes/shoppingLists.routes'; // Importiere den Router für die Listen

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware, um JSON-Requests zu verarbeiten
app.use(express.json());

// Beispielroute
app.get('/', (req, res) => {
    res.send('Willkommen zur Einkaufslisten-App!');
});

// Füge den Listen-Router hinzu
app.use('/api/lists', listsRouter); // Hier fügst du die Listen-Routen hinzu

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
