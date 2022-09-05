import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema';
import { queries } from './resolvers/queries';
import { mutations } from './resolvers/mutations';
import dotenv from 'dotenv';
import mongoClientPromise from './mongo/mongo';

import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';

const run = async () => {
  dotenv.config();

  console.log('Connecting to MongoDB...');
  const client = await mongoClientPromise;
  console.log('MongoDB connected');

  const dbName = process.env.DATABASE_NAME;
  const authorsCollection = await client.db(dbName).collection('authors');
  const booksCollection = await client.db(dbName).collection('books');
  const pressHousesCollection = await client
    .db(dbName)
    .collection('pressHouses');

  // The ApolloServer constructor requires two parameters: your schema
  // definition and your set of resolvers.
  const server = new ApolloServer({
    typeDefs,
    resolvers: { ...queries, ...mutations },
    csrfPrevention: true,
    cache: 'bounded',
    context: async ({ req, res }) => {
      return {
        authorsCollection,
        booksCollection,
        mongoClient: client,
        pressHousesCollection,
      };
    },

    /**
     * What's up with this embed: true option?
     * These are our recommended settings for using AS;
     * they aren't the defaults in AS3 for backwards-compatibility reasons but
     * will be the defaults in AS4. For production environments, use
     * ApolloServerPluginLandingPageProductionDefault instead.
     **/
    plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
  });

  // The `listen` method launches a web server.
  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
};

run();
