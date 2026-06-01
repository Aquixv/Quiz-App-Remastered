import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', correctAnswer: '', incorrectAnswers: ['', '', ''] }
  ]);
  const [generatedCode, setGeneratedCode] = useState(null);

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', correctAnswer: '', incorrectAnswers: ['', '', ''] }]);
  };

  const deleteQuestion = (index) => {
    if (questions.length === 1) return; 
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

const user = JSON.parse(localStorage.getItem('user'));
const quizData = {
    quizTitle: quizTitle,
    questions: questions,
    creatorName: user.username,
    creatorId: user.id || user._id 
};

  const handleInputChange = (index, field, value, subIndex = null) => {
    const updatedQuestions = [...questions];
    if (subIndex !== null) {
      updatedQuestions[index].incorrectAnswers[subIndex] = value;
    } else {
      updatedQuestions[index][field] = value;
    }
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quizData)
});
      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.joinCode);
      }
    } catch (err) {
      console.error("Error saving quiz:", err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  if (generatedCode) {
    return (
      <div className="bg-deep-purple min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass-card p-10 rounded-3xl max-w-md w-full border border-electric-violet/30 shadow-2xl">
          <span className="material-symbols-outlined text-neon-yellow text-7xl mb-4">task_alt</span>
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Published!</h2>
          <p className="text-lavender-light/60 mb-8">Share this code with your friends to let them join.</p>
          
          <div className="bg-deep-purple p-6 rounded-2xl border border-glass-border mb-8 flex flex-col items-center">
            <span className="text-4xl font-mono font-bold text-electric-violet tracking-widest">{generatedCode}</span>
            <button 
              onClick={copyToClipboard}
              className="mt-4 text-xs font-bold uppercase text-neon-yellow flex items-center gap-2 hover:opacity-80"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span> Copy Code
            </button>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="w-full h-14 bg-electric-violet text-white rounded-xl font-bold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-deep-purple min-h-screen p-6 text-lavender-light font-display pb-32">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Create Custom Quiz</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <input 
          className="w-full p-4 rounded-xl bg-white/5 border border-glass-border focus:border-electric-violet outline-none"
          placeholder="Quiz Title"
          onChange={(e) => setQuizTitle(e.target.value)}
          required 
        />
        
        {questions.map((q, i) => (
          <div key={i} className="p-6 rounded-2xl glass-card space-y-4 relative group">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-electric-violet">Question {i + 1}</h3>
                <button 
                    type="button" 
                    onClick={() => deleteQuestion(i)}
                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
            <input 
              className="w-full p-3 rounded-lg bg-deep-purple border border-glass-border"
              placeholder="Question Text"
              value={q.questionText}
              onChange={(e) => handleInputChange(i, 'questionText', e.target.value)}
              required 
            />
            <input 
              className="w-full p-3 rounded-lg bg-green-900/10 border border-green-500/20"
              placeholder="Correct Answer"
              value={q.correctAnswer}
              onChange={(e) => handleInputChange(i, 'correctAnswer', e.target.value)}
              required 
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {q.incorrectAnswers.map((ans, subI) => (
                <input 
                  key={subI}
                  className="p-3 rounded-lg bg-red-900/10 border border-red-500/20"
                  placeholder={`Wrong Answer ${subI + 1}`}
                  value={ans}
                  onChange={(e) => handleInputChange(i, 'incorrectAnswers', e.target.value, subI)}
                  required 
                />
              ))}
            </div>
          </div>
        ))}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 w-full max-w-lg px-6 z-50">
          <button type="button" onClick={addQuestion} className="flex-1 h-16 rounded-2xl bg-deep-purple border-2 border-electric-violet text-electric-violet font-bold backdrop-blur-xl">
            + Add Question
          </button>
          <button type="submit" className="flex-1 h-16 rounded-2xl bg-neon-yellow text-deep-purple font-bold shadow-xl shadow-neon-yellow/20">
            Publish Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;