import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE_URL from './config'; 
import './Quiz.css';
import confetti from 'canvas-confetti';


import Higuruma from '../assets/Higuruma.png';
import Hesnotreading from '../assets/Not-reading.png';
import Regret from '../assets/Regret.png';
import doesheknow from '../assets/doesheknow.png';
import speed from '../assets/speed.jpg';

const Quiz = ({ category, amount, difficulty }) => {
    const location = useLocation();
    const navigate = useNavigate();


    const [index, setIndex] = useState(() => {
        const saved = localStorage.getItem('active_quiz');
        return saved ? JSON.parse(saved).index : 0;
    });

    const [data, setData] = useState(() => {
        if (location.state?.customQuiz) {
            localStorage.removeItem('active_quiz');
            return location.state.customQuiz.map(q => ({
                ...q,
                question: q.questionText || q.question,
                correct_answer: q.correctAnswer || q.correct_answer,
                answers: q.answers ? q.answers : [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5)
            }));
        }
        const saved = localStorage.getItem('active_quiz');
        if (saved) return JSON.parse(saved).data;
        return [];
    });

    const [lock, setLock] = useState(false);
    const [score, setScore] = useState(0);
    const [result, setResult] = useState(false);
    const [loading, setLoading] = useState(true);

    const Option1 = useRef(null);
    const Option2 = useRef(null);
    const Option3 = useRef(null);
    const Option4 = useRef(null);
    const option_array = [Option1, Option2, Option3, Option4];

    const submitFinalScore = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
    
    const payload = {
        userId: user?.id || user?._id || null, 
        username: user?.username || "Guest", 
        score: score * 10, 
        quizId: location.state?.quizId || null,
        categoryId: category || '9',
        totalQuestions: data.length
    };

        try {
            await fetch(`${API_BASE_URL}/api/scores`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log("🏆 Score logged successfully!");
        } catch (err) {
            console.error("❌ Network error saving score:", err);
        }
    };

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
                        const formatted = resData.results.map(q => ({
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

    const decodeHTML = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    const checkAnswer = (e, ans) => {
        if (!lock) {
            const correct = decodeHTML(data[index].correct_answer);
            if (correct === ans) {
                e.target.classList.add("correct");
                setScore(prev => prev + 1);
            } else {
                e.target.classList.add("incorrect");
                option_array.forEach(opt => {
                    if (opt.current && decodeHTML(opt.current.innerText) === correct) {
                        opt.current.classList.add("correct");
                    }
                });
            }
            setLock(true);
        }
    };

    const next = () => {
        if (lock) {
            if (index === data.length - 1) {
                setResult(true);
                submitFinalScore();
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
return { msg: "Ts won't take you to heaven btw", color: "#00d397", gif: doesheknow }};
        if (percentage >= 80) return { msg: "You're not him", color: "#ff4a4a", gif: Regret };
        if (percentage >= 50) return { msg: "", color: "#553f9a", gif: Higuruma };
        if (percentage === 0) return { msg: "Did you even read?", color: "#ff4a4a", gif: Hesnotreading };
        return { msg: "Time to Hit the Books... 📚", color: "#ff4a4a", gif: speed };
    };

    if (loading) return <div className='container'><h2>Loading Questions...</h2></div>;

    const feedback = getFeedback();

    return (
        <div className='container'>
            {result ? (
                <div className="result-container">
                    <img src={feedback.gif} alt="Reaction" className="result-gif" />
                    <h2 style={{ color: feedback.color }}>{feedback.msg}</h2>
                    <h3>You scored {score} out of {data.length}</h3>
                    <div className='result-buttons'>
                        <button onClick={() => navigate('/setup')}>New Quiz?</button>
                        <button onClick={() => navigate('/')}>Home</button>
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
                    <button onClick={next}>Next</button>
                    <div className="index">{index + 1} of {data.length} questions</div>
                </>
            )}
        </div>
    );
};

export default Quiz;