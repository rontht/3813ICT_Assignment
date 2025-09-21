import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function readJson(filePath) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error.message);
    return null;
  }
}

export function writeJson(filePath, data) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const jsonString =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(fullPath, jsonString, "utf8");
    return true;
  } catch (error) {
    console.error("Error writing JSON file:", error.message);
    return false;
  }
}
