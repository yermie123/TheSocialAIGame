import pg from "pg";
const { Pool } = pg;
import express from "express";
import "dotenv/config";

const app = express();
const pool = new Pool({
  host: process.env.VITE_PG_HOST,
  port: process.env.VITE_PG_PORT,
  user: process.env.VITE_PG_USER,
  password: process.env.VITE_PG_PASSWORD,
  database: process.env.VITE_PG_DATABASE,
  ssl: {
    rejectUnauthorized: false, // Enable SSL with self-signed certificates
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20, // maximum number of clients in the pool
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function generateRandomAnimalName() {
  const animalNames = ["Lion", "Tiger", "Bear", "Monkey", "Giraffe"];
  return animalNames[Math.floor(Math.random() * animalNames.length)];
}

function generateRandomAnimalData() {
  const animalNames = ["Elephant", "Kangaroo", "Penguin", "Koala", "Crocodile"];
  const randomAnimalNames = animalNames
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  return {
    animals: randomAnimalNames,
    number: Math.floor(Math.random() * 28) + 12,
  };
}

app.post("/addtoDB1", async (req, res) => {
  try {
    // Create table query
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS test1 (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          data JSONB
        );
    `;

    let retries = 0;
    const maxRetries = 3;

    try {
      await pool.query(createTableQuery);
    } catch (err) {
      console.error("Error creating table:", err);
      return res.status(500).json({
        error: "Error creating table",
      });
    }

    // Insert data
    const randomAnimalName = generateRandomAnimalName();
    const randomAnimalData = generateRandomAnimalData();

    const insertDataQuery = `
        INSERT INTO test1 (name, data)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const result = await pool.query(insertDataQuery, [
      randomAnimalName,
      JSON.stringify(randomAnimalData),
    ]);

    return res.json({
      message: "Data inserted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
