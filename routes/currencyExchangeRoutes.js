import express from 'express';
import {
  refreshCountries,
  getCountries,
  getCountryByName,
  getStatus,
  getSummaryImage,
  deleteCountryByName
} from '../controller/currencyExchangeController.js';

const router = express.Router();

router.post('/countries/refresh', refreshCountries);
router.get('/countries', getCountries);
router.get('/countries/image', getSummaryImage);
router.get('/countries/:name', getCountryByName);
router.delete('/countries/:name', deleteCountryByName);
router.get('/status', getStatus);


export default router;
