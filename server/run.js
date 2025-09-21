import { read, add, update, remove } from "./functions.js";
import User from "./models/user.js";

// let items = await read("user");
// console.log(items);

let entry = new User("super1", "Super1", "super1@com", "123", "super-admin");
let result = await add("user", entry);
console.log(result);
