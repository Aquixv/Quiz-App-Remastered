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

interface QuestionInput {
  questionText: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}
interface CreateQuizArgs {
  quizTitle: string;
  creatorName?: string;
  creatorId: string;
  questions: QuestionInput[];
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
  const scores = await Score.find({ quizId: null }) 
    .sort({ score: -1 })
    .limit(100)
    .populate('quizId')
    .populate('userId');

  return scores.map((score: any) => {
    const scoreObj = score.toObject();
    return {
      ...scoreObj,
      userId: score.userId?._id || score.userId || null,
      username: score.username || score.userId?.username || "Anonymous Player"
    };
  });
},

getLeaderboardByCategory: async (_: any, { categoryId }: { categoryId: string }) => {
  const scores = await Score.find({ categoryId, quizId: null })
    .sort({ score: -1 })
    .limit(100)
    .populate('quizId')
    .populate('userId');

  return scores.map((score: any) => {
    const scoreObj = score.toObject();
    return {
      ...scoreObj,
      userId: score.userId?._id || score.userId || null,
      username: score.username || score.userId?.username || "Anonymous Player"
    };
  });
},

    getUserHistory: async (_: any, { userId }: { userId: string }) => {
      const scores = await Score.find({ userId })
        .sort({ createdAt: -1 })
        .populate('quizId')
        .populate('userId');

      return scores.map((score: any) => {
        const scoreObj = score.toObject();
        return {
          ...scoreObj,
          userId: score.userId?._id || score.userId || null,
          username: score.username || score.userId?.username || "Anonymous Player"
        };
      });
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
    },
    deleteQuiz: async (_: any, { id }: { id: string }, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in to delete a quiz.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const quiz = await Quiz.findById(id);
      if (!quiz) {
        throw new Error("Quiz not found");
      }
      if (quiz.creatorId.toString() !== context.user.userId) {
        throw new GraphQLError('You are not authorized to delete this quiz.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
      await Quiz.findByIdAndDelete(id);
      return true;
    }
  }
};