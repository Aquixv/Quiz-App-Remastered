import bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken'
import User from "../models/User";
import Quiz from "../models/Quiz"; 
import Score from "../models/Score";

interface RegisterArgs {
  username: string;
  password: string; 
}

interface CreateQuizArgs {
  quizTitle: string;
  creatorName?: string;
  creatorId: string;
  questions: string[]; 
}

export const resolvers = {
  Query: {
    getUsers: async () => {
      return await User.find({});
    },
    getUser: async (_: unknown, { id }: { id: string }) => {
      return await User.findById(id);
    },
  },
  
  Mutation: {
    registerUser: async (_: unknown, { username, password }: RegisterArgs) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new User({ 
        username, 
        password: hashedPassword,
        totalPoints: 0 
      });
      
      return await newUser.save();
    },
    loginUser: async (_: any, { username, password }: any) => {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error("User not found");
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid password");
      }

      const secret = process.env.API_SECRET || "Error in JWT name";
      const token = jwt.sign(
        { userId: user._id, username: user.username }, 
        secret, 
        { expiresIn: '1d' } 
      );
      return {
        token,
        user
      };
    },
    createQuiz: async (_: unknown, args: CreateQuizArgs) => {
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newQuiz = new Quiz({
        quizTitle: args.quizTitle,
        creatorName: args.creatorName || "Anonymous",
        creatorId: args.creatorId,
        questions: args.questions,
        joinCode: generatedCode
      });
      
      return await newQuiz.save();
    }
  }
};