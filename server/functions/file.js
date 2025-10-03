import multer from "multer";
import path from "path";

// Chat images
export const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/chat"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadChat = multer({ storage: chatStorage });

// Avatar images
export const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/avatar"),
  filename: (req, file, cb) => {  
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadAvatar = multer({ storage: avatarStorage });
