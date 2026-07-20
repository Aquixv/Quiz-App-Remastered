import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './typeDefs';
import * as jwt from 'jsonwebtoken';
import { resolvers } from './resolvers';
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();
export interface MyContext {
  user?: { userId: string; username: string };
}

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.URI as string);
    console.log('📦 Connected to MongoDB!');

    const { url } = await startStandaloneServer(server, {
      listen: { 
        port: Number(process.env.PORT) || 4000,
        host: '0.0.0.0'
      },
      context: async ({ req }): Promise<MyContext> => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) return {}; 

        try {
          const decoded = jwt.verify(token, process.env.API_SECRET as string) as any;
          
          return { 
            user: { 
              userId: decoded.userId, 
              username: decoded.username 
            } 
          };
        } catch (err) {
          return {}; 
        }
      },
    });
    
    console.log(`🚀 GraphQL Server ready at: ${url}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

startServer();