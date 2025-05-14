import { ApolloServer } from 'apollo-server';
import typeDefs from './schema.ts';
import resolvers from './resolvers.ts';
import dotenv from 'dotenv';
dotenv.config();

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});