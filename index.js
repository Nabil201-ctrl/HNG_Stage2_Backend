
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import env from 'dotenv';
import { dbInit } from './database/dbInit.js';
import currencyExchangeRoutes from './routes/currencyExchangeRoutes.js';

// configuration
env.config();
const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Initialize DB
dbInit();

// routes
app.use('/', currencyExchangeRoutes);

const PORT = process.env.PORT ;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

