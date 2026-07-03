import React, { useState, useEffect } from 'react';
import './Setup.css';
import { useNavigate, Link } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { QuizSettingsState } from '../App';

export interface QuizSettings {
  amount: number;
  category: number | string;
  difficulty: string;
}

interface Category {
  id: number;
  name: string;
}

interface SetupProps { 
  setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettingsState>>;
}

const GET_CUSTOM_QUIZZES = gql`
  query GetQuizByCode($joinCode: String!) {
    getQuizByCode(joinCode: $joinCode) {
      _id
      createdAt
      creatorId
      creatorName
      joinCode
      questions {
        questionText
        correctAnswer
        incorrectAnswers
      }
      quizTitle
    }
  }
`;

interface JoinQuizResponse {
  getQuizByCode: {
    _id: string;
    quizTitle: string;
    questions: {
      questionText: string;
      correctAnswer: string;
      incorrectAnswers: string[];
    }[];
  } | null;
}

const Setup = ({ setQuizSettings }: SetupProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState<string>('');
  const [isJoinVisible, setIsJoinVisible] = useState<boolean>(false);

  const [formData, setFormData] = useState<QuizSettingsState>({
    amount: 10,
    category: '9',
    difficulty: 'easy'
  });

  const [getQuiz, { loading: joinLoading }] = useLazyQuery<JoinQuizResponse>(GET_CUSTOM_QUIZZES);
  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then(res => res.json())
      .then(data => setCategories(data.trivia_categories || []))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJoinQuiz = async () => {
    const cleanedCode = joinCode.trim().toUpperCase();
    if (!cleanedCode) {
      alert("Please enter a valid code!");
      return;
    }

    try {
  
      const { data } = await getQuiz({ 
        variables: { joinCode: cleanedCode },
      });

      if (data?.getQuizByCode) {
        navigate('/quiz', { 
          state: { 
            customQuiz: data.getQuizByCode.questions,
            quizId: data.getQuizByCode._id 
          } 
        });
      } else {
        alert("Quiz not found! Please check the code.");
      }
    } catch (err) {
      console.error("Join error:", err);
      alert("Failed to establish a connection with the server.");
    }
  };

  const handleStart = () => {
    setQuizSettings(formData);
    navigate('/quiz'); 
  };

  return (
    <div className="min-h-screen bg-deep-purple text-lavender-light flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h2>Customize Your Challenge</h2>
        <hr />
        
        <div className='settings-group'>
          <p style={{marginTop:'12px'}}>Select Difficulty</p>
          <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="">Random</option>
          </select>
        </div>

        <div className='settings-group' style={{paddingTop:'10px'}}>
          <p>Number of Questions</p>
          <input 
            type="number" name="amount" min="1" max="20" 
            value={formData.amount} onChange={handleChange} 
          />
        </div>

        <div className='settings-group'>
          <p>Select Category</p> 
          <select name="category" className="category-select" value={formData.category} onChange={handleChange}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className='buttons'>
          <button className="w-full max-w-[250px] py-4 mt-4 rounded-xl font-bold transition-all duration-300 backdrop-blur-md bg-electric-violet/20 border border-electric-violet/50 text-white hover:bg-electric-violet/40 hover:shadow-[0_0_2px_rgba(139,92,246,0.3)]" onClick={handleStart}>
            Start Quiz
          </button>
          <div className="join-container" style={{ width: '250px', marginTop: '8px' }}>
            <button 
               className="w-full max-w-[250px] py-4 rounded-xl font-bold transition-all duration-300 backdrop-blur-md bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
               onClick={() => setIsJoinVisible(!isJoinVisible)}
            >
                {isJoinVisible ? 'Cancel' : 'Join Custom Quiz'}
            </button>

            {isJoinVisible && (
                <div className="join-dropdown" style={{ display: 'flex', marginTop:'4px', gap: '10px', animation: 'fadeIn 0.3s' }}>
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit code..." 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        style={{
                            width:'200px',
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #553f9a',
                            backgroundColor: '#fff',
                            color: '#000'
                        }}
                    />
                    <button 
                        onClick={handleJoinQuiz}
                        disabled={joinLoading}
                        style={{
                            padding: '0 20px',
                            backgroundColor: '#e2ff3d',
                            color: '#1a0b2e',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            opacity: joinLoading ? 0.5 : 1
                        }}
                    >
                        {joinLoading ? '...' : 'JOIN'}
                    </button>
                </div>
            )}
          </div>
          <button className="w-full max-w-[250px] py-4 mt-2 rounded-xl font-bold transition-all duration-300 backdrop-blur-md bg-electric-violet/20 border border-electric-violet/50 text-white hover:bg-electric-violet/40 hover:shadow-[0_0_2px_rgba(139,92,246,0.3)]" onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    </div>
  );
};

export default Setup;