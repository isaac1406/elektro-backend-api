import { Request } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Define o diretório base para uploads
const UPLOADS_BASE_DIR = path.resolve(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req: Request, file, callback) {
    let destinationFolder: string;

    if (file.mimetype.startsWith("video/")) {
      destinationFolder = path.join(UPLOADS_BASE_DIR, "videos");
    } else if (file.mimetype.startsWith("audio/")) {
      destinationFolder = path.join(UPLOADS_BASE_DIR, "audios");
    } else {
      // fotos dos produtos vão para cá
      destinationFolder = path.join(UPLOADS_BASE_DIR, "photos");
    }

    callback(null, destinationFolder);
  },
  
  filename: function (req: Request, file, callback) {
    // Gera um nome de arquivo único usando UUID e mantém a extensão original
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname); // Ex: .jpg, .png
    const newFilename = `${uniqueSuffix}${fileExtension}`;

    callback(null, newFilename);
  },
});

// Configuração Multer para upload de fotos (para produtos)
const photoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limite de 5MB por foto (ajuste conforme necessário)
    files: 10, // Permite o upload de até 10 fotos por vez para um produto
  },
  fileFilter: function (req: Request, file, callback) {
    const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (!allowedFileTypes.includes(file.mimetype)) {
      const messages = "Somente arquivos JPG, JPEG e PNG são suportados.";
      // Retorna um erro para o Multer
      return callback(new Error(messages));
    }
    // Aceita o arquivo
    callback(null, true);
  },
});

// Configuração Multer para upload de áudios (mantido para referência, mas não usado para produtos)
const audioUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 7, // 7MB
    files: 10,
  },
  fileFilter: function (req: Request, file, callback) {
    const allowedFileTypes = ["audio/mp3", "audio/m4a"];

    if (!allowedFileTypes.includes(file.mimetype)) {
      const messages = "Somente arquivos MP3 e M4A são suportados.";
      return callback(new Error(messages));
    }

    callback(null, true);
  },
});

export { photoUpload, audioUpload };