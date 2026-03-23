import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root directory
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

export default {
  db: process.env.MONGODB_URI || 'mongodb://localhost:27017/joshuadesroches-db'
};
   
   