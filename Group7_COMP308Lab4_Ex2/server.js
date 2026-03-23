import dotenv from 'dotenv';
dotenv.config({ quiet: true }); // Load environment variables from .env file
import express from 'express';
import { ApolloServer } from '@apollo/server';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import configureMongoose from './config/mongoose.js';
import typeDefs from './server/graphQL/typeDefs.js';
import resolvers from './server/graphQL/resolvers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

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
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();