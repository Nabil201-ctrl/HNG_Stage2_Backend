# Country-Currency-and-Exchange-API

A RESTful API that fetches country data from an external API, stores it in a database, and provides CRUD operations.

### Features

- Fetches country data from `restcountries.com`.
- Fetches exchange rates from `open.er-api.com`.
- Caches the data in a MySQL database.
- Provides endpoints to:
    - Refresh the data from the external APIs.
    - Get all countries with filtering and sorting.
    - Get a single country by name.
    - Delete a country by name.
    - Get the status of the database (total countries and last refresh time).
    - Get a summary image of the data.

## Prerequisites

- Node.js 18+
- npm 8+
- A MySQL database (local or cloud-based).

## Setup

1.  **Dependencies:**
    - `express`
    - `mysql2`
    - `dotenv`
    - `cors`
    - `body-parser`
    - `jimp`
    - `nodemon`

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the project root and set the following environment variables:
    ```bash
    DATABASE_URL=mysql://user:password@host:port/database
    PORT=3000
    ```
    Replace the `DATABASE_URL` with your actual database connection string.

## Run

-   **Development:**
    ```bash
    npm run dev
    ```
-   **Production:**
    ```bash
    npm start
    ```

The server will start on `http://localhost:<PORT>`.

## API

### `POST /countries/refresh`

Fetches the latest country and exchange rate data from the external APIs, updates the database, and generates a new summary image.

**Response `200 OK`**

```json
{
    "message": "Country data refreshed successfully."
}
```

### `GET /countries`

Returns a list of all countries from the database. Supports filtering and sorting.

**Query Parameters:**

-   `region`: Filter by region (e.g., `?region=Africa`).
-   `currency`: Filter by currency code (e.g., `?currency=NGN`).
-   `sort`: Sort by estimated GDP in descending order (e.g., `?sort=gdp_desc`).

**Response `200 OK`**

```json
[
    {
        "id": 1,
        "name": "Nigeria",
        "capital": "Abuja",
        "region": "Africa",
        "population": 206139589,
        "currency_code": "NGN",
        "exchange_rate": 1600.23,
        "estimated_gdp": 25767448125,
        "flag_url": "https://flagcdn.com/ng.svg",
        "last_refreshed_at": "2025-10-26T10:00:00.000Z"
    },
    ...
]
```

### `GET /countries/:name`

Returns a single country by its name.

**Response `200 OK`**

```json
{
    "id": 1,
    "name": "Nigeria",
    ...
}
```

**Error Response `404 Not Found`**

```json
{
    "error": "Country not found"
}
```

### `DELETE /countries/:name`

Deletes a country by its name.

**Response `200 OK`**

```json
{
    "message": "Country deleted successfully"
}
```

**Error Response `404 Not Found`**

```json
{
    "error": "Country not found"
}
```

### `GET /status`

Returns the total number of countries in the database and the timestamp of the last refresh.

**Response `200 OK`**

```json
{
    "total_countries": 250,
    "last_refreshed_at": "2025-10-26T10:00:00.000Z"
}
```

### `GET /countries/image`

Returns the summary image.

**Response `200 OK`**

An image file (`image/png`).

**Error Response `404 Not Found`**

```json
{
    "error": "Summary image not found"
}
```

