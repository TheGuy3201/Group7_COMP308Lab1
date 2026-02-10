import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the project root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("🔍 Environment check:");
console.log("MONGODB_URI from .env:", process.env.MONGODB_URI ? "✅ Loaded" : "❌ NOT loaded");
console.log("Full URI:", process.env.MONGODB_URI);

const config = {
    env: process.env.NODE_ENV || 'development', 
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key", 
    mongoUri: process.env.MONGODB_URI ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' + 
   (process.env.MONGO_PORT || '27017') +
    '/assignment1ex2' 
    }
    export default config
   
   