import { connectDB, getDB, closeDB } from "../db.js";
import { promises as fs } from "fs";
import PATHS from "../paths.js";

async function readJson(filePath) {
  try {
    const url = new URL(filePath, import.meta.url);
    const raw = await fs.readFile(url, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.createdAt) {
          item.createdAt = new Date(item.createdAt);
        }
      });
    }
    return data;
  } catch (error) {
    console.error("~~ error reading or parsing JSON file:", error.message);
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
    console.log(`>> ${name} collection seeded.`);
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

export async function add(name, entry) {
  if (!name) throw new Error("~~ collection name is required");
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`);
  if (!entry || typeof entry !== "object")
    throw new Error(`~~ ${entry} is invalid.`);
  try {
    await connectDB();
    const db = getDB();
    const result = await db.collection(name).insertOne(entry);
    return result;
  } catch (e) {
    console.error(`~~ adding to ${name} failed:`, e.message);
  } finally {
    await closeDB();
  }
}

export async function get(name, id) {
  if (!name) throw new Error("~~ collection name is required");
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`);
  if (!id || typeof id !== "object") throw new Error(`~~ ${id} is invalid`);
  try {
    await connectDB();
    const db = getDB();
    const item = await db.collection(name).findOne(id);
    return item;
  } catch (e) {
    console.error(`find item in ${name} failed:`, e.message);
  } finally {
    await closeDB();
  }
}

export async function update(name, id, changes) {
  if (!name) throw new Error("~~ collection name is required");
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`);
  if (!id || typeof id !== "object") throw new Error(`~~ ${id} is invalid`);
  if (!changes || typeof changes !== "object")
    throw new Error(`~~ ${changes} is invalid`);
  try {
    await connectDB();
    const db = getDB();
    const result = await db
      .collection(name)
      .replaceOne(id, changes, { upsert: false });
    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    };
  } catch (e) {
    console.error("~~ update failed:", e.message);
  } finally {
    await closeDB();
  }
}

export async function remove(name, id) {
  if (!name) throw new Error("~~ collection name is required");
  if (!PATHS[name]) throw new Error(`~~ unknown collection "${name}".`);
  if (!id || typeof id !== "object") throw new Error(`~~ ${id} is invalid`);
  try {
    await connectDB();
    const db = getDB();
    const result = await db.collection(name).deleteOne(id);
    return result;
  } catch (err) {
    console.error(`~~ error while removing in  ${name}: `, err.message);
  } finally {
    await closeDB();
  }
}
