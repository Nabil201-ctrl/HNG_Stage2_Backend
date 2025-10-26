import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const connection = mysql.createPool(process.env.DATABASE_URL);

export const dbInit = async () => {
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Country (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(255),
        population INT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate FLOAT,
        estimated_gdp BIGINT,
        flag_url VARCHAR(255),
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "Country" created or already exists.');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS Status (
        id INT AUTO_INCREMENT PRIMARY KEY,
        total_countries INT,
        last_refreshed_at TIMESTAMP
      )
    `);
    console.log('Table "Status" created or already exists.');

    // Check if status table is empty and insert a default row
    const [status] = await connection.query('SELECT * FROM Status');
    if (status.length === 0) {
      await connection.query('INSERT INTO Status (id, total_countries, last_refreshed_at) VALUES (1, 0, NULL)');
      console.log('Default status inserted.');
    }


  } catch (error) {
    console.error('Error during database initialization:', error);
  }
};
