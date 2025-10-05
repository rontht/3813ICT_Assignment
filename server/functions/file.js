import multer from "multer";
import path from "path";

const createStorage = (folder) =>
  multer.diskStorage({
    // save the file in respective folders
    destination: (req, file, callback) => {
      callback(null, `uploads/${folder}`);
    },
    // make unique name by combining date + 3 random num and original file extension
    filename: (req, file, callback) => {
      const unique = Date.now() + Math.round(Math.random() * 1000);
      callback(null, unique + path.extname(file.originalname));
    },
  });

export const uploadChat = multer({ storage: createStorage("chat") });
export const uploadAvatar = multer({ storage: createStorage("avatar") });
