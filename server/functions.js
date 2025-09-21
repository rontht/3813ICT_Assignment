import { connectDB, getDB, closeDB, health } from "./db.js";
import { promises as fs } from "fs";
import PATHS from ".paths.js";

async function readJson(filePath) {
  const url = new URL(filePath, import.meta.url);
  const raw = await fs.readFile(url, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`~~ file must contain a JSON array`);
  }
  return data;
}

export async function seed(name) {
  const path = PATHS[name];
  if (!path) throw new Error(`~~ unknown collection "${name}".`);
  let items;
  try {
    items = await readJson(path);
  } catch (e) {
    console.error(`~~ failed to load seed for "${name}":`, e.message);
  }
  if (!items.length) {
    console.warn(`~~ no items to seed for "${name}".`);
    return;
  }
  try {
    await connectDB();
    await health();
    const db = getDB();
    const exists = await db.listCollections({ name: name }).hasNext();
    if (exists) await db.collection(name).drop();
    await db.collection(name).insertMany(items);
    console.log(">> collection reset with seed completed.");
  } catch (err) {
    console.error("~~ seed failed:", err.message);
    throw err;
  } finally {
    await closeDB();
  }
}

export async function read(name) {
  if (!name) throw new Error("~~ collection name is required");
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`);
  try {
    await connectDB();
    const db = getDB();
    const items = await db.collection(name).find({}).sort({ id: 1 }).toArray();
    return items;
  } catch (e) {
    console.error("~~ reading failed:", e.message);
  } finally {
    await closeDB();
  }
}

export async function add(name, item) {
  if (!name) throw new Error("~~ collection name is required");
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`);
  if (!item || typeof item !== "object")
    throw new Error(`~~ ${item} is not an object.`);
  try {
    await connectDB();
    const db = getDB();
    const result = await db.collection(name).insertOne(item);
    return result;
  } catch (e) {
    console.error(`~~ adding to ${name} failed:`, e.message);
  } finally {
    await closeDB();
  }
}

export async function update() {
  try {
    await connectDB();
    const db = getDB();

    const filter = { id: 2 };
    const update = {
      $set: {
        price: 99.99,
        units: 50,
        description: "Newly updated product 2's description",
      },
    };

    const result = await db.collection(COLLECTION).updateOne(filter, update);

    if (result.matchedCount === 0) {
      console.log("Error while trying to update.");
    } else {
      console.log("Update successful.");
    }
  } catch (e) {
    console.error("create product failed:", e.message);
  } finally {
    await closeDB();
  }
}

export async function remove() {
  try {
    await connectDB();
    const db = getDB();

    const filter = { id: 3 };

    const result = await db.collection(COLLECTION).deleteOne(filter);

    if (result.deletedCount === 0) {
      console.log("Error while trying to remove.");
    } else {
      console.log("Remove completed.");
    }
  } catch (err) {
    console.error("Delete failed:", err.message);
  } finally {
    await closeDB();
  }
}
