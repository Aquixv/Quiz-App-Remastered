import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Quiz.css';
import confetti from 'canvas-confetti';
import Higuruma from '../assets/Higuruma.png';
import Hesnotreading from '../assets/Not-reading.png';
import Regret from '../assets/Regret.png';
import doesheknow from '../assets/doesheknow.png';
import speed from '../assets/speed.jpg';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

interface QuestionData {
    question: string;
    correct_answer: string;
    incorrect_answers?: string[];
    answers: string[];
    questionText?: string;
    correctAnswer?: string;
    incorrectAnswers?: string[];
}

interface QuizLocationState {
    customQuiz?: QuestionData[];
    quizId?: string;
}

interface QuizProps {
    category: string;
    amount: number;
    difficulty: string;
}
const SUBMIT_SCORE_MUTATION = gql`
  mutation SubmitScore($userId: ID, $username: String!, $score: Int!, $quizId: ID, $categoryId: String, $totalQuestions: Int) {
    submitScore(userId: $userId, username: $username, score: $score, quizId: $quizId, categoryId: $categoryId, totalQuestions: $totalQuestions) {
      _id
    }
  }
`;

const Quiz = ({ category, amount, difficulty }: QuizProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const locationState = location.state as QuizLocationState | null;

    const [index, setIndex] = useState<number>(() => {
        const saved = localStorage.getItem('active_quiz');
        return saved ? JSON.parse(saved).index : 0;
    });

    const [data, setData] = useState<QuestionData[]>(() => {
        if (locationState?.customQuiz) {
            localStorage.removeItem('active_quiz');
            return locationState.customQuiz.map((q: any) => ({
                ...q,
                question: q.questionText || q.question,
                correct_answer: q.correctAnswer || q.correct_answer,
                answers: q.answers ? q.answers : [...(q.incorrectAnswers || []), q.correctAnswer || q.correct_answer].sort(() => Math.random() - 0.5)
            }));
        }
        const saved = localStorage.getItem('active_quiz');
        if (saved) return JSON.parse(saved).data;
        return [];
    });

    const [lock, setLock] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [result, setResult] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [guestName, setGuestName] = useState('');
    const [needsNamePrompt, setNeedsNamePrompt] = useState(false);
    const [scoreSaved, setScoreSaved] = useState(false);

    const [submitScore] = useMutation(SUBMIT_SCORE_MUTATION);

    const Option1 = useRef<HTMLLIElement>(null);
    const Option2 = useRef<HTMLLIElement>(null);
    const Option3 = useRef<HTMLLIElement>(null);
    const Option4 = useRef<HTMLLIElement>(null);
    const option_array = [Option1, Option2, Option3, Option4];
    useEffect(() => {
        if (data.length > 0) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}${difficulty ? `&difficulty=${difficulty}` : ''}&type=multiple`;

        const timer = setTimeout(() => {
            fetch(url)
                .then(res => res.json())
                .then(resData => {
                    if (isMounted && resData?.results) {
                        const formatted = resData.results.map((q: any) => ({
                            ...q,
                            answers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)
                        }));
                        setData(formatted);
                        setLoading(false);
                    }
                })
                .catch(err => console.log("API is chilling..."));
        }, 1000);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [amount, category, difficulty, data.length]);

    useEffect(() => {
        if (data.length > 0 && !result) {
            const quizState = { data, index, score, quizSettings: { amount, category, difficulty } };
            localStorage.setItem('active_quiz', JSON.stringify(quizState));
        }
    }, [index, score, data, result]);

    useEffect(() => {
        if (result) localStorage.removeItem('active_quiz');
    }, [result]);

    const decodeHTML = (html: string) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    const checkAnswer = (e: React.MouseEvent<HTMLLIElement>, ans: string) => {
        if (!lock) {
            const correct = decodeHTML(data[index].correct_answer);
            const target = e.currentTarget; 

            if (correct === ans) {
                target.classList.add("correct");
                setScore(prev => prev + 1);
            } else {
                target.classList.add("incorrect");
                option_array.forEach(opt => {
                    if (opt.current && decodeHTML(opt.current.innerText) === correct) {
                        opt.current.classList.add("correct");
                    }
                });
            }
            setLock(true);
        }
    };
    const executeScoreSubmission = async (playerName: string, playerId: string | null = null) => {
        try {
            await submitScore({
                variables: {
                    userId: playerId, 
                    username: playerName, 
                    score: score * 10, 
                    quizId: locationState?.quizId || null,
                    categoryId: category || '9',
                    totalQuestions: data.length
                }
            });
            console.log("🏆 Score logged via GraphQL!");
            setScoreSaved(true);
            setNeedsNamePrompt(false);
            
            if (!playerId) {
                localStorage.setItem('user', JSON.stringify({ username: playerName }));
            }
        } catch (err) {
            console.error("GraphQL mutation failed:", err);
        }
    };

    const next1 = () => {
        if (lock) {
            if (index === data.length - 1) {
                setResult(true);
                const userString = localStorage.getItem('user');
                const localUser = userString ? JSON.parse(userString) : null;
                
                if (localUser && localUser.username) {
                    executeScoreSubmission(localUser.username, localUser.id || localUser._id);
                } else {
                    setNeedsNamePrompt(true);
                }
                return;
            }
            setIndex(prev => prev + 1);
            setLock(false);
            option_array.forEach(opt => opt.current && opt.current.classList.remove("correct", "incorrect"));
        }
    };

    const getFeedback = () => {
        const percentage = (score / data.length) * 100;
        if (percentage === 100) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00d397', '#ffffff', '#553f9a']
            });
            return { msg: "You're not him", color: "#00d397", gif: doesheknow };
        }
        if (percentage >= 60) return { msg: "", color: "#ff4a4a", gif: Regret };
        if (percentage >= 50) return { msg: "", color: "#553f9a", gif: Higuruma };
        if (percentage === 0) return { msg: "", color: "#ff4a4a", gif: Hesnotreading };
        return { msg: "", color: "#ff4a4a", gif: speed };
    };

    if (loading) return <div className='container'><h2>Loading Questions...</h2></div>;

    const feedback = getFeedback();

    return (
        <div className='container'>
            {result ? (
                <div className="result-container">
                    <img src={feedback.gif} alt="Reaction" className="result-gif" />
                    <h2 style={{ color: feedback.color }}>{feedback.msg}</h2>
                    <h3 style={{display:'flex', alignItems:'center', gap:'10px'}}>{score*10} Points! <img style={{width:'5vw', height:'10vh'}} src="https://www.svgrepo.com/show/513363/trophy.svg" alt="" /></h3>
                    {needsNamePrompt && !scoreSaved && (
                        <div className="w-full mt-6 p-5 bg-black/20 border border-electric-violet/30 rounded-2xl">
                            <p className="text-sm font-bold text-white mb-3 text-center">Claim Your Leaderboard Spot!</p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter Name..." 
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    maxLength={15}
                                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white outline-none focus:border-electric-violet"
                                />
                                <button 
                                    onClick={() => {
                                        if (guestName.trim().length > 0) {
                                            executeScoreSubmission(guestName.trim());
                                        }
                                    }}
                                    disabled={!guestName.trim()}
                                    className="bg-neon-yellow text-deep-purple font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {scoreSaved && (
                        <p className="text-neon-yellow font-bold mt-4">Score saved to the Hall of Fame! 🏆</p>
                    )}

                    <div className='result-buttons'>
                        <button className="w-full max-w-[250px] py-4 mt-2 rounded-xl font-bold transition-all duration-300 backdrop-blur-md bg-electric-violet/20 border border-electric-violet/50 text-white hover:bg-electric-violet/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]" onClick={() => navigate('/setup')}>New Quiz?</button>
                        <button className="w-full max-w-[250px] py-4 mt-2 rounded-xl font-bold transition-all duration-300 backdrop-blur-md bg-electric-violet/20 border border-electric-violet/50 text-white hover:bg-electric-violet/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]" onClick={() => navigate('/')}>Home</button>
                    </div>
                </div>
            ) : (
                <>
                    <h2>{index + 1}. {decodeHTML(data[index].question)}</h2>
                    <ul>
                        {data[index].answers.map((ans, i) => (
                            <li key={i} ref={option_array[i]} onClick={(e) => checkAnswer(e, decodeHTML(ans))}>
                                {decodeHTML(ans)}
                            </li>
                        ))}
                    </ul>
                    <button onClick={next1}>Next</button>
                    <div className="index">{index + 1} of {data.length} questions</div>
                </>
            )}
        </div>
    );
};

export default Quiz;