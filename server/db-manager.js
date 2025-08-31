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

function appendJson(filePath, newData) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    // Read current content or start with empty array
    let existingData = [];
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, "utf8");
      existingData = JSON.parse(raw);
    }

    // Ensure existing content is an array
    if (!Array.isArray(existingData)) {
      throw new Error("Existing JSON is not an array.");
    }

    // Append new data
    if (Array.isArray(newData)) {
      existingData.push(...newData);
    } else {
      existingData.push(newData);
    }

    // Write updated array back to file
    fs.writeFileSync(fullPath, JSON.stringify(existingData, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error appending to JSON file:", error.message);
    return false;
  }
}

module.exports = {
  readJson,
  writeJson,
  appendJson,
};
