import { Collection } from 'mongodb';

export type Context = {
  authorsCollection: Collection;
  booksCollection: Collection;
  pressHousesCollection: Collection;
};
