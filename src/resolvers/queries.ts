// Resolvers define the technique for fetching the types defined in the

import { ApolloError } from 'apollo-server';
import { Collection, ObjectId } from 'mongodb';
import { Context } from '../types';

// schema. This resolver retrieves books from the "books" array above.

export const queries = {
  Query: {
    authors: async (parent: any, args: any, { authorsCollection }: Context) => {
      return authorsCollection.find().toArray();
    },
    author: async (parent: any, args: {id: string}, { authorsCollection }: Context) => {
      return authorsCollection.findOne({_id: new ObjectId(args.id)});
    },
    books: async (parent: any, args: any, { booksCollection }: Context) => {
      return booksCollection.find().toArray();
    },
    book: async (parent: any, args: {id: string}, { booksCollection }: Context) => {
      return booksCollection.findOne({_id: new ObjectId(args.id)});
    },
    presshouses: async (parent: any, args: any, { pressHousesCollection }: Context) => {
      return pressHousesCollection.find().toArray();
    },
    presshouse: async (parent: any, args: {id: string}, { pressHousesCollection }: Context) => {
      return pressHousesCollection.findOne({_id: new ObjectId(args.id)});
    },
  },
  Author: {
    books: async (parent: any, args: any, { booksCollection }: Context) => {
      const books = await booksCollection
        .find({ authorId: parent._id.toString() })
        .toArray();

      return books;
    },
    id: (parent: any) => {
      return parent._id;
    },
  },
  PressHouse: {
    books: async (parent: any, args: any, { booksCollection }: Context) => {
      const books = await booksCollection
        .find({ pressHouseId: parent._id.toString() })
        .toArray();

      return books;
    },
    id: (parent: any) => {
      return parent._id;
    },
  },
  Book: {
    author: async (parent: any, args: any, { authorsCollection }: Context) => {
      return await authorsCollection.findOne({
        _id: new ObjectId(parent.authorId),
      });
    },
    id: (parent: any) => {
      return parent._id;
    },
    pressHouse: async (
      parent: any,
      args: any,
      { pressHousesCollection }: Context
    ) => {
      return await pressHousesCollection.findOne({
        _id: new ObjectId(parent.pressHouseId),
      });
    },
  },
};

// export const Book = {
//   id: (parent: any) => {
//     return parent._id;
//   },
// };
