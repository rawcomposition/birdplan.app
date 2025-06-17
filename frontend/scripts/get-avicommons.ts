import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";

const downloadAndSaveData = async () => {
  try {
    const url = "https://avicommons.org/latest-lite.json";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    const filePath = path.join(__dirname, "../public/avicommons.json");
    fs.writeFileSync(filePath, JSON.stringify(jsonData));

    console.log("Successfully downloaded from Avicommons.org");
  } catch (error) {
    console.error("Error downloading or saving data:", error);
  }
};

downloadAndSaveData();
