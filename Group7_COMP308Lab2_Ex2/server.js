import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import express from 'express';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import configureMongoose from './config/mongoose.js';
import typeDefs from './server/graphQL/typeDefs.js';
import resolvers from './server/graphQL/resolvers.js';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

const avatarsPath = path.join(__dirname, "public/avatars");

// Ensure folder exists (VERY IMPORTANT)
if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsPath);   // Absolute path
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'));
    }
  }
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await configureMongoose();
    
    // Create Apollo Server
    const server = new ApolloServer({ 
      typeDefs, 
      resolvers 
    });
    
    await server.start();
    
    // Middleware
    app.use(cors());
    app.use(express.json());
    
    // Serve static files from public/avatars
    app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
    
    // File upload endpoint
    app.post('/upload/avatar', upload.single('avatar'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const avatarURL = `http://localhost:${PORT}/avatars/${req.file.filename}`;
      res.json({ 
        success: true,
        avatarURL,
        filename: req.file.filename 
      });
    });
    
    // GraphQL endpoint - Manual integration
    app.post('/graphql', async (req, res) => {
      try {
        const { query, variables, operationName } = req.body;
        const result = await server.executeOperation({
          query,
          variables,
          operationName
        });
        
        if (result.body.kind === 'single') {
          res.json(result.body.singleResult);
        } else if (result.body.kind === 'incremental') {
          res.json(result.body.initialResult);
        } else {
          res.status(400).json({ error: 'Unknown response type' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // GraphQL introspection endpoint for Apollo Sandbox
    app.get('/graphql', (req, res) => {
      res.send(`
        <html>
          <body style="margin:0;font-family:sans-serif">
            <h1 style="text-align:center;padding:20px">GraphQL Server Running</h1>
            <p style="text-align:center">Use POST requests to /graphql to query the API</p>
            <p style="text-align:center">Or use a GraphQL client like Apollo Studio or Postman</p>
          </body>
        </html>
      `);
    });
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 GraphQL server ready at http://localhost:${PORT}/graphql`);
      console.log(`📁 Avatar uploads available at http://localhost:${PORT}/upload/avatar`);
      console.log(`🖼️  Avatars served from http://localhost:${PORT}/avatars/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();