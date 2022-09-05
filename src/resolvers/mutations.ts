import { ApolloError } from 'apollo-server';
import { Collection, MongoClient, ObjectId } from 'mongodb';

export const mutations = {
  Mutation: {
    addPressHouse: async (
      parent: any,
      args: { name: string; web: string; country: string },
      context: { pressHousesCollection: Collection }
    ) => {
      const { name, web, country } = args;

      const { pressHousesCollection } = context;

      try {
        const result = await pressHousesCollection.insertOne({
          name,
          web,
          country,
        });
        return { insertedId: result.insertedId };
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    addAuthor: async (
      parent: any,
      args: { name: string; lang: string },
      context: { authorsCollection: Collection }
    ) => {
      const { name, lang } = args;

      const { authorsCollection } = context;

      try {
        const result = await authorsCollection.insertOne({
          name,
          lang,
        });
        return { insertedId: result.insertedId };
      } catch (error) {
        console.log(error);
        return null;
      }
    },
    addBook: async (
      parent: any,
      args: {
        title: string;
        authorId: string;
        pressHouseId: string;
        year: number;
      },
      context: {
        booksCollection: Collection;
        authorsCollection: Collection;
        pressHousesCollection: Collection;
      }
    ) => {
      const { title, authorId, pressHouseId, year } = args;

      const { authorsCollection, booksCollection, pressHousesCollection } =
        context;

      try {
        let mongoAuthorId;
        try {
          mongoAuthorId = new ObjectId(authorId);
        } catch (error) {
          return new ApolloError('Invalid author id', '400');
        }

        const author = await authorsCollection.findOne({
          _id: mongoAuthorId,
        });

        if (!author) {
          return new ApolloError('Author not found', '404');
        }

        let mongoPressHouseId;
        try {
          mongoPressHouseId = new ObjectId(pressHouseId);
        } catch (error) {
          return new ApolloError('Invalid press house id', '400');
        }

        const pressHouse = await pressHousesCollection.findOne({
          _id: mongoPressHouseId,
        });

        if (!pressHouse) {
          return new ApolloError('PressHouse not found', '404');
        }

        const result = await booksCollection.insertOne({
          title,
          authorId,
          pressHouseId,
          year,
        });
        return { insertedId: result.insertedId };
      } catch (error) {
        console.log(error);
        return new ApolloError('Server Error', '500');
      }
    },
    deleteAuthor: async (
      parent: any,
      args: {
        id: string;
      },
      context: {
        authorsCollection: Collection;
        booksCollection: Collection;
        mongoClient: MongoClient;
      }
    ) => {
      const { id } = args;

      const { authorsCollection, booksCollection, mongoClient } = context;

      try {
        const session = mongoClient.startSession();

        await session.withTransaction(async () => {
          const author = await authorsCollection.findOne({
            _id: new ObjectId(id),
          });

          if (!author) {
            console.log('author not found');
            throw new ApolloError('Not Found', '404');
          }

          const { deletedCount } = await authorsCollection.deleteOne({
            _id: new ObjectId(id),
          });

          if (deletedCount === 0) {
            throw new ApolloError('Server Error', '500');
          }

          await booksCollection.deleteMany({
            authorId: id,
          });
        });
      } catch (error) {
        if ((error as Error).message === 'Not Found') {
          return new ApolloError('Not Found', '404');
        }
        return new ApolloError('Server Error', '500');
      }

      return 'Author and related books succesfully deleted';
    },
    deletePressHouse: async (
      parent: any,
      args: {
        id: string;
      },
      context: {
        pressHousesCollection: Collection;
        booksCollection: Collection;
        mongoClient: MongoClient;
      }
    ) => {
      const { id } = args;

      const { pressHousesCollection, booksCollection, mongoClient } = context;

      try {
        const session = mongoClient.startSession();

        await session.withTransaction(async () => {
          const pressHouse = await pressHousesCollection.findOne({
            _id: new ObjectId(id),
          });

          if (!pressHouse) {
            console.log('pressHouse not found');
            throw new ApolloError('Not Found', '404');
          }

          const { deletedCount } = await pressHousesCollection.deleteOne({
            _id: new ObjectId(id),
          });

          if (deletedCount === 0) {
            throw new ApolloError('Server Error', '500');
          }

          await booksCollection.deleteMany({
            pressHouseId: id,
          });
        });
      } catch (error) {
        if ((error as Error).message === 'Not Found') {
          return new ApolloError('Not Found', '404');
        }
        return new ApolloError('Server Error', '500');
      }

      return 'PressHouse and related books succesfully deleted';
    },
    deleteBook: async (
      parent: any,
      args: {
        id: string;
      },
      context: {
        booksCollection: Collection;
      }
    ) => {
      const { id } = args;

      const { booksCollection } = context;

      // search for the book
      const book = await booksCollection.findOne({ _id: new ObjectId(id) });

      // if the book does not exist return a not found error
      if (!book) {
        return new ApolloError('Not Found', '404');
      }

      // if the book exists delete it
      const { deletedCount } = await booksCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (deletedCount === 0) {
        return new ApolloError('Server Error', '500');
      }

      return 'Book succesfully deleted';
    },
  },
};
