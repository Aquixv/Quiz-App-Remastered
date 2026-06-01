import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const MyQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id || user?._id;
    
     const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }
        fetchQuizzes();
    }, [userId]); 

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/my-quizzes/${userId}`);
            const data = await res.json();
            
            console.log("Fetched Quizzes:", data); 
            
            setQuizzes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching quizzes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this quiz?")) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/quizzes/${id}`, { 
                    method: 'DELETE' 
                });
                if (res.ok) {
                    setQuizzes(prev => prev.filter(q => q._id !== id));
                }
            } catch (err) {
                alert("Failed to delete quiz.");
            }
        }
    };

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
                {loading ? (
                    <div className="text-center py-20 opacity-50">Loading your creations...</div>
                ) : quizzes.length > 0 ? (
                    quizzes.map(quiz => (
                        <div key={quiz._id} className="glass-card p-5 rounded-2xl border border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="font-bold text-white text-lg">{quiz.quizTitle}</h3>
                                <p className="text-xs text-lavender-light/40 mt-1">
                                    CODE: <span onClick={copyToClipboard} className="text-neon-yellow font-mono font-bold tracking-widest uppercase">{quiz.joinCode}</span>
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