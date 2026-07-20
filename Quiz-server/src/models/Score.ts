import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScore extends Document {
    userId?: Types.ObjectId;
    username?: string; 
    quizId?: Types.ObjectId;
    categoryId?: string; 
    score: number;
    totalQuestions?: number;
    createdAt: Date;
}

const ScoreSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, required: false }, 
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: false },
    categoryId: { type: String }, 
    score: { type: Number, required: true },
    totalQuestions: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IScore>('Score', ScoreSchema);