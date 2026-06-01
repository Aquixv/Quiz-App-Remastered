import mongoose, { Schema, Document, Types } from 'mongoose';
export interface IQuestion {
    questionText: string;
    correctAnswer: string;
    incorrectAnswers: string[];
}

export interface IQuiz extends Document {
    quizTitle: string;
    joinCode: string;
    creatorName: string;
    creatorId: Types.ObjectId;
    questions: IQuestion[];
    createdAt: Date;
}

const QuizSchema: Schema = new Schema({
    quizTitle: { type: String, required: true },
    joinCode: { type: String, unique: true, required: true },
    creatorName: { type: String, default: "Anonymous" },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    questions: [
        {
            questionText: { type: String, required: true },
            correctAnswer: { type: String, required: true },
            incorrectAnswers: [{ type: String, required: true }]
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);