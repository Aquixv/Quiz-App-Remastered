export interface Question {
    questionText: string;
    correctAnswer: string;
    incorrectAnswers: string[];
}

export interface Quiz {
    id: string;
    quizTitle: string;
    joinCode: string;
    name: string;
    questions: Question[];
    _id: number;
}

export interface User {
    username: string;
    totalPoints: number;
    score:number;
    totalQuestions:number;
    _id: number
    id:string;
    rank:string;
}
export interface Score {
  _id: string;
  score: number;
  quizId?: {
    _id: string;
    quizTitle: string;
  }
  username:string;
  categoryId:string;
  createdAt:string;
}