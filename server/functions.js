import { connectDB, getDB, closeDB } from "./db.js";
import { promises as fs } from "fs";
import PATHS from "./paths.js";

async function readJson(filePath) {
  try {
    const url = new URL(filePath, import.meta.url);
    const raw = await fs.readFile(url, "utf8");
    const data = JSON.parse(raw);
    return data;
  } catch (error) {
    console.error("Error reading or parsing JSON file:", error.message);
    return null;
  }
}

async function setup(db, name, schema, key) {
  const exists = await db.listCollections({ name: name }).hasNext();
  if (exists) await db.collection(name).drop();
  await db.createCollection(name, { validator: { $jsonSchema: schema } });
  if (name === "user")
    await db.collection(name).createIndex(key, { unique: true });
  console.log(`>> ${name} collection created!`);
}

export async function seed(name) {
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`); // validate name
  const schema = await readJson(PATHS[name].schema);
  const items = await readJson(PATHS[name].seed);
  const key = PATHS[name].key;
  if (!schema) return; // check null and undefine
  if (!items) return; // check null and undefine
  if (!key) return; // check null and undefine
  if (items.length === 0) return; // check if array is empty
  try {
    await connectDB();
    const db = getDB();
    await setup(db, name, schema, key); // drop and setup the collection
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
