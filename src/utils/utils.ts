import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import { memoryStorage } from 'multer';
import * as path from 'path';
export async function saveFile(file: Express.Multer.File) {
  const randomNumber = Math.floor(Math.random() * 1000) + 1;
  const projectRoot = path.resolve(__dirname, '../../'); // Remonte à la racine
  const uploadDir = path.join(projectRoot, 'uploads'); // Ch
  const parts = file.originalname.split('.');

  const ext = parts[parts.length - 1];
  fs.mkdirSync(uploadDir, { recursive: true });
  const filename = `file_${randomNumber}_${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, file.buffer as any);
  return {
    projectRoot,
    fullPath: filePath
  };
}

export function createJsonFile(filename: string, jsonData: string) {
  const projectRoot = path.resolve(__dirname, '../../'); // Remonte à la racine
  const uploadDir = path.join(projectRoot, 'uploads', 'quran', 'json'); // Ch

  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, jsonData);
  return filePath;
}

export function createDataJsonFile(jsonData: string) {
  const projectRoot = path.resolve(__dirname, '../../'); // Remonte à la racine
  const uploadDir = path.join(projectRoot, 'uploads', 'data'); // Ch
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, 'data.json');
  fs.writeFileSync(filePath, jsonData, { encoding: 'utf-8' });
  return filePath;
}

export function watchJsonFile(cb: () => void) {
  const projectRoot = path.resolve(__dirname, '../../'); // Remonte à la racine
  const uploadDir = path.join(projectRoot, 'uploads', 'data'); // Ch
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, 'data.json');
  fs.watchFile(filePath, {}, (cur) => {
    console.log('file changed');
    cb();
  });
  return filePath;
}

export function getDataJson() {
  const projectRoot = path.resolve(__dirname, '../../'); // Remonte à la racine
  const uploadDir = path.join(projectRoot, 'uploads', 'data'); // Ch
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, 'data.json');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, { encoding: 'utf-8' });
  }
  return null;
}

export function useMulterMemoryStorageModule() {
  return MulterModule.register({
    storage: memoryStorage()
  });
}
