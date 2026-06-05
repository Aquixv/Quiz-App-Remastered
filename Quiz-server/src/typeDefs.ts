export const typeDefs = `#graphql
  type User {
    _id: ID!
    username: String!
    totalPoints: Int
    createdAt: String
  }
    input QuestionInput {
  questionText: String!
  correctAnswer: String!
  incorrectAnswers: [String!]!
}
  type Question {
  questionText: String!
  correctAnswer: String!
  incorrectAnswers: [String!]!
}

type Quiz {
  _id: ID!
  quizTitle: String!
  joinCode: String!
  creatorName: String
  creatorId: ID!
  questions: [Question!]!
  createdAt: String
}
   type Query {
  getQuizzes: [Quiz]
  getQuiz(id: ID!): Quiz
  getQuizByCode(joinCode: String!): Quiz
  getUsers: [User]
  getUser(id: ID!): User
  }
type AuthPayload {
  token: String!
  user: User!
}
  type Mutation {
  registerUser(username: String!, password: String!): User
  loginUser(username: String!, password: String!): AuthPayload
  createQuiz(
    quizTitle: String!
    creatorName: String
    creatorId: ID!
    questions: [QuestionInput!]!
  ): Quiz
}
`;