const fs = require("fs");
const path = require("path");

function readJson(filePath) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error.message);
    return null;
  }
}

function writeJson(filePath, data) {
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

module.exports = {
  readJson,
  writeJson
};
