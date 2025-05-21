import express from "express";
import fetch from "node-fetch";
import { writeFileSync, existsSync } from "fs";
import { schedule } from "node-cron";
import categories from "./categories.json" with { type: "json" };

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_PATH = "./data/heads.json";

// Function to fetch data
async function fetchAllHeads() {
  const result = {};

  for (const cat of categories) {
    try {
      const url = `https://minecraft-heads.com/scripts/api.php?cat=${cat}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0, sophiethefox.cc" },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      result[cat] = data;
    } catch (err) {
      console.error(`Error fetching category ${cat}:`, err);
    }
  }

  writeFileSync(DATA_PATH, JSON.stringify(result, null, 2));
  console.log("Data updated.");
}

// Run once on startup
fetchAllHeads();

// Schedule to run every 5 days
schedule("0 0 */5 * *", fetchAllHeads);

// Serve JSON file
app.get("/heads.json", (req, res) => {
  if (existsSync(DATA_PATH)) {
    res.sendFile(path.join(__dirname, DATA_PATH));
  } else {
    res.status(404).send("File not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
