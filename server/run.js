import { read, add, get, update, remove } from "./functions.js";
import { seed } from "./functions.js";
import User from "./models/user.js";

let entry = new User("testing", "Test", "test@com", "123", "user");
let replacement = new User("testing", "Ron", "ron@com", "123", "super-admin");

// await seedDefaultData();
await readCollection("user");
// await findItemFromCollection("group", { id: "g001" });
// await addItemToCollection("user", entry);
// await updateItemFromCollection("user", { username: "testing" }, replacement);
// await deleteItemFromCollection("user", { username: "testing" });

// delete current collections and seed default data
async function seedDefaultData() {
  await seed("user");
  await seed("group");
  await seed("channel");
}
// read everything from collection
async function readCollection(name) {
  let items = await read(name);
  console.log(items);
}
// find and return data for id from collection
async function findItemFromCollection(name, id) {
  let item = await get(name, id);
  console.log(item);
}
// add new item to collection
async function addItemToCollection(name, entry) {
  let result = await add(name, entry);
  console.log(result);
}
// update an item from collection
async function updateItemFromCollection(name, id, changes) {
  let result = await update(name, id, changes);
  console.log(result);
}

async function deleteItemFromCollection(name, id) {
  let result = await remove(name, id);
  console.log(result);
}
