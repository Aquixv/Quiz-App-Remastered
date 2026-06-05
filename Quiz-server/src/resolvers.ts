import User from "../models/User";
import Quiz from "../models/User";
import Score from "../models/Score";

export const resolvers = {
  Query: {
    getUsers: async () => {
      return await User.find({});
    },
    getUser: async (_: any, { id }: { id: string }) => {
      return await User.findById(id);
    },
  },
  
  Mutation: {
    registerUser: async (_: any, { username, password }: any) => {
      const newUser = new User({ 
        username, 
        password,
        totalPoints: 0 
      });
      
      return await newUser.save();
    }
  }
};