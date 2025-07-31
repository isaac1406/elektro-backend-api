import express from 'express';
import configDotenv from './src/config/dotenv';
import cors from 'cors';
import routes from './src/routes/routes';
import passport from 'passport'; // <-- IMPORTANTE: Importe passport
import { configAuth } from './src/middlewares/authentication'; 
import path from 'path';
import fs from 'fs';

configDotenv();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
configAuth();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));  

app.use(cors());
app.use(routes);

app.get('/', (req, res) => {
  res.send('API Elektro Backend funcionando!')
});

app.listen(port, () => {
console.log(`${process.env.APP_NAME} app listening at http://localhost:${port}`);
});
    