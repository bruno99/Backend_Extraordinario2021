import { gql } from 'apollo-server';

export const typeDefs = gql`
  type PressHouse {
    id: ID!
    name: String
    web: String
    country: String
    books: [Book]
  }

  type Author {
    id: ID!
    name: String
    lang: String
    books: [Book]
  }

  type Book {
    id: ID!
    author: Author
    pressHouse: PressHouse
    title: String
    year: Int
  }

  type AddResult {
    insertedId: ID!
  }

  type Query {
    authors: [Author]
    author(id: ID): Author
    books: [Book]
    book(id: ID): Book
    presshouses: [PressHouse]
    presshouse(id: ID): PressHouse
  }

  type Mutation {
    addPressHouse(name: String!, web: String!, country: String!): AddResult
    addAuthor(name: String!, lang: String!): AddResult
    addBook(title: String!, authorId: String!, pressHouseId: String!, year: Int!): AddResult
    deleteAuthor(id: ID!): String
    deleteBook(id: ID!): String
    deletePressHouse(id: ID!): String
  }
`;