import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

// Ensure upload directories exist - use process.cwd() for Docker compatibility
const uploadsDir = join(process.cwd(), 'uploads');
const avatarsDir = join(uploadsDir, 'avatars');
const documentsDir = join(uploadsDir, 'documents');

if (!existsSync(avatarsDir)) {
  mkdirSync(avatarsDir, { recursive: true });
}
if (!existsSync(documentsDir)) {
  mkdirSync(documentsDir, { recursive: true });
}

export const avatarStorage = {
  storage: diskStorage({
    destination: avatarsDir,
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error('Invalid file type. Allowed: jpeg, png, gif, webp'), false);
      return;
    }
    callback(null, true);
  },
};

export const documentStorage = {
  storage: diskStorage({
    destination: documentsDir,
    filename: (req, file, callback) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      callback(new Error('Invalid file type. Allowed: pdf, jpeg, png'), false);
      return;
    }
    callback(null, true);
  },
};