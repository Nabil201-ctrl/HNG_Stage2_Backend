import { connection } from '../database/dbInit.js';
import { countryData, countryExcahngeRate } from '../util/currencyExchangeHelpers.js';
import jimp from 'jimp';
import fs from 'fs';

export const refreshCountries = async (req, res) => {
  try {
    // Fetch data
    const [countriesResponse, ratesResponse] = await Promise.all([
      countryData(req, res),
      countryExcahngeRate(req, res)
    ]);
    if (countriesResponse.error) {
      return res.status(503).json({ error: "External data source unavailable", details: "Could not fetch data from restcountries.com" });
    }
    if (ratesResponse.error) {
      return res.status(503).json({ error: "External data source unavailable", details: "Could not fetch data from open.er-api.com" });
    }

    const countries = countriesResponse;
    const rates = ratesResponse.rates;

    const processedCountries = countries.map(country => {
      const currency_code = country.currencies && country.currencies[0] ? country.currencies[0].code : null;
      const exchange_rate = currency_code ? rates[currency_code] : null;
      const estimated_gdp = (exchange_rate && country.population) ?
        Math.round(country.population * (Math.random() * (2000 - 1000) + 1000) / exchange_rate) : 0;

      return [
        country.name,
        country.capital,
        country.region,
        country.population,
        currency_code,
        exchange_rate,
        estimated_gdp,
        country.flag
      ];
    });

    // 4. Update Database
    const sql = `
      INSERT INTO Country (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        capital = VALUES(capital),
        region = VALUES(region),
        population = VALUES(population),
        currency_code = VALUES(currency_code),
        exchange_rate = VALUES(exchange_rate),
        estimated_gdp = VALUES(estimated_gdp),
        flag_url = VALUES(flag_url)
    `;
    await connection.query(sql, [processedCountries]);

    const total_countries = processedCountries.length;
    const last_refreshed_at = new Date();
    await connection.execute('UPDATE Status SET total_countries = ?, last_refreshed_at = ? WHERE id = 1', [total_countries, last_refreshed_at]);

    // Generate image
    await generateSummaryImage(total_countries, last_refreshed_at);


    res.status(200).json({ message: 'Country data refreshed successfully.' });
  } catch (error) {
    console.error('Error refreshing country data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateSummaryImage = async (total_countries, last_refreshed_at) => {
  const [topCountries] = await connection.query('SELECT name, estimated_gdp FROM Country ORDER BY estimated_gdp DESC LIMIT 5');

  const image = new jimp(800, 600, '#ffffff');
  const font = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);

  image.print(font, 10, 10, 'Country Data Summary');
  image.print(font, 10, 50, `Total Countries: ${total_countries}`);
  image.print(font, 10, 90, `Last Refresh: ${last_refreshed_at.toUTCString()}`);

  image.print(font, 10, 150, 'Top 5 Countries by Estimated GDP:');
  topCountries.forEach((country, index) => {
    image.print(font, 10, 190 + (index * 40), `${index + 1}. ${country.name}: ${country.estimated_gdp}`);
  });

  const imagePath = 'cache/summary.png';
  await image.writeAsync(imagePath);
};

export const getCountries = async (req, res) => {
  try {
    let sql = 'SELECT * FROM Country';
    const params = [];

    if (req.query.region) {
      sql += ' WHERE region = ?';
      params.push(req.query.region);
    }

    if (req.query.currency) {
      if (params.length > 0) {
        sql += ' AND';
      } else {
        sql += ' WHERE';
      }
      sql += ' currency_code = ?';
      params.push(req.query.currency);
    }

    if (req.query.sort === 'gdp_desc') {
      sql += ' ORDER BY estimated_gdp DESC';
    }

    const [countries] = await connection.execute(sql, params);
    res.json(countries);
  } catch (error) {
    console.error('Error getting countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const [country] = await connection.execute('SELECT * FROM Country WHERE name = ?', [name]);
    if (country.length === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.json(country[0]);
  } catch (error) {
    console.error('Error getting country by name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStatus = async (req, res) => {
  try {
    const [status] = await connection.query('SELECT total_countries, last_refreshed_at FROM Status WHERE id = 1');
    if (status.length === 0) {
      return res.status(404).json({ error: 'Status not found' });
    }
    res.json(status[0]);
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSummaryImage = (req, res) => {
  const imagePath = 'cache/summary.png';
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath, { root: '.' });
  } else {
    res.status(404).json({ error: 'Summary image not found' });
  }
};

export const deleteCountryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const [result] = await connection.execute('DELETE FROM Country WHERE name = ?', [name]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Country not found' });
    }
    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Error deleting country by name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
