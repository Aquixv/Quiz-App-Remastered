import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { typeDefs } from './typeDefs';
import * as jwt from 'jsonwebtoken'
import User from '../models/User';
import { resolvers } from './resolvers';
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.URI as string);
    console.log('📦 Connected to MongoDB!');

    const { url } = await startStandaloneServer(server, {
      listen: { port: 4000 },
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');

        if (!token) return { user: null };

        try {
          const decoded = jwt.verify(token, process.env.API_SECRET as string) as any;
          const user = await User.findById(decoded.id).select('-password');
          return { user }; 
        } catch (err) {
          return { user: null }; 
        }
      },
    });
console.log(`🚀 GraphQL Server ready at: ${url}`);
} catch (error) {
console.error('Database connection failed:', error);
}
};
startServer();