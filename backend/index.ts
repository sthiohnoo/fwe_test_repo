import express from 'express';
import { ENV } from './src/config/env.config';

const app = express();

// Middleware
app.use((req, _res, next) => {
    console.info(`New request to ${req.path}`);
    next();
});

app.get('/', (_req, res) => {
    res.send('Willkommen zur Einkaufslisten-App! juhu');
});

// Server starten
app.listen(ENV.PORT, () => {
    console.log(`Server läuft auf http://localhost:${ENV.PORT}`);
});
