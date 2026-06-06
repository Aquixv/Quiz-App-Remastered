import bcrypt from "bcrypt";
import * as jwt from 'jsonwebtoken'
import User from "../models/User";
import Quiz from "../models/Quiz"; 
import Score from "../models/Score";
import { GraphQLError } from 'graphql';
import { MyContext } from './index'; 

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
    getQuizzes: async () => {
      return await Quiz.find({}).sort({ createdAt: -1 });
    },
    getQuiz: async (_: any, { id }: { id: string }) => {
      return await Quiz.findById(id);
    },
    getQuizByCode: async (_: any, { joinCode }: { joinCode: string }) => {
      return await Quiz.findOne({ joinCode: joinCode.toUpperCase() });
    },
    getLeaderboard: async () => {
      return await Score.find({})
        .sort({ score: -1 })
        .limit(100)
        .populate('quizId');
  },
  getLeaderboardByCategory: async (_: any, { categoryId }: { categoryId: string }) => {
      return await Score.find({ categoryId })
        .sort({ score: -1 })
        .limit(100)
        .populate('quizId');
    },
    getUserHistory: async (_: any, { userId }: { userId: string }) => {
      return await Score.find({ userId })
        .sort({ createdAt: -1 })
        .populate('quizId');
    }
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
    createQuiz: async (_: any, args: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in to create a quiz.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newQuiz = new Quiz({
        quizTitle: args.quizTitle,
        creatorName: context.user.username,
        creatorId: context.user.userId,     
        questions: args.questions,
        joinCode: generatedCode
      });
      
      return await newQuiz.save();
    },
    submitScore: async (_: any, args: any) => {
      const newScore = new Score({
        userId: args.userId || null,
        username: args.username,
        score: args.score,
        quizId: args.quizId || null,
        categoryId: args.categoryId || '9',
        totalQuestions: args.totalQuestions || 10
      });
      return await newScore.save();
    }
  }
};