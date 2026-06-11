import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Quiz } from '../quiz';

interface DeltQuiz {
  deleteQuiz: boolean;
}
interface QuizResponse {
getQuizzes: Quiz[];
}
const QUERY_FETCHQUIZ = gql`
  query GetQuizzes {
    getQuizzes {
      _id
      quizTitle
      joinCode
      creatorName
      createdAt
      questions {
        questionText
        correctAnswer
        incorrectAnswers
      }
    }
  }
`;

const DELETE_QUIZ_MUTATION = gql`
  mutation DeleteQuiz($id: ID!) {
    deleteQuiz(id: $id)
  }
`;

const MyQuizzes = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id || user?._id;
    const { data, loading: queryLoading, error } = useQuery<QuizResponse>(QUERY_FETCHQUIZ, {
        fetchPolicy: 'network-only'
    });

    const [deleteQuiz] = useMutation<DeltQuiz>(DELETE_QUIZ_MUTATION);
    useEffect(() => {
        if (!userId) {
            navigate('/');
        }
    }, [userId, navigate]); 

    useEffect(() => {
        if (data?.getQuizzes) {
            setQuizzes(data.getQuizzes);
        }
    }, [data]);

    const copyToClipboard = (code: string) => {
        if (code) {
            navigator.clipboard.writeText(code);
        }
    };

    const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
        try {
            const { data } = await deleteQuiz({ variables: { id } });
            if (data?.deleteQuiz) {
                setQuizzes(prev => prev.filter(q => q._id !== id)); 
            }
        } catch (err: any) {
            alert(err.message || "Failed to delete quiz.");
        }
    }
};
    const isLoaderVisible = queryLoading && quizzes.length === 0;

    return (
        <div className="bg-deep-purple min-h-screen p-6 text-lavender-light">
            <header className="flex items-center mb-8">
                <button 
                    onClick={() => navigate('/profile')} 
                    className="material-symbols-outlined mr-4 hover:text-white transition-colors"
                >
                    arrow_back
                </button>
                <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">My Custom Quizzes</h1>
            </header>

            <div className="space-y-4">
                {isLoaderVisible ? (
                    <div className="text-center py-20 opacity-50 animate-pulse">Loading your creations...</div>
                ) : error ? (
                    <div className="text-center py-20 text-red-400">Failed to sync with the server.</div>
                ) : quizzes.length > 0 ? (
                    quizzes.map(quiz => (
                        <div key={quiz._id} className="glass-card p-5 rounded-2xl border border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="font-bold text-white text-lg">{quiz.quizTitle}</h3>
                                <p className="text-xs text-lavender-light/40 mt-1">
                                    CODE: <span onClick={() => copyToClipboard(quiz.joinCode)} className="text-neon-yellow font-mono font-bold tracking-widest uppercase cursor-pointer hover:underline">{quiz.joinCode}</span>
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleDelete(quiz._id)} 
                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                    title="Delete Quiz"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                                <button 
                                    onClick={() => navigate('/quiz', { state: { quizId: quiz._id, customQuiz: quiz.questions } })} 
                                    className="bg-electric-violet/20 p-2 rounded-xl text-electric-violet hover:bg-electric-violet hover:text-white transition-all"
                                    title="Play Quiz"
                                >
                                    <span className="material-symbols-outlined">play_arrow</span>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 opacity-30 italic">
                        <span className="material-symbols-outlined block text-4xl mb-2">inventory_2</span>
                        You haven't created any quizzes yet.
                    </div>
                )}
            </div>
            
            <button 
                onClick={() => navigate('/create')}
                className="fixed bottom-10 right-6 size-16 bg-neon-yellow text-black rounded-full shadow-[0_0_20px_rgba(238,255,0,0.3)] flex items-center justify-center font-black text-3xl hover:scale-110 active:scale-95 transition-all"
            >
                +
            </button>
        </div>
    );
};

export default MyQuizzes;