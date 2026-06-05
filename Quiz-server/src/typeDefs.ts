export const typeDefs = `#graphql
  type User {
    _id: ID!
    username: String!
    totalPoints: Int
    createdAt: String
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    registerUser(username: String!, password: String!): User
  }
`;