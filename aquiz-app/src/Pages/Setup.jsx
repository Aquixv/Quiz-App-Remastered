import React, { useState, useEffect } from 'react';
import './Setup.css';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const Setup = ({ setQuizSettings }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
const [joinCode, setJoinCode] = useState('');
const [isJoinVisible, setIsJoinVisible] = useState(false); 

const handleJoinQuiz = async () => {
    if (!joinCode.trim()) {
        alert("Please enter a valid code!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/quizzes/join/${joinCode}`);
        const data = await response.json();

        if (response.ok) {
            navigate('/quiz', { state: { customQuiz: data.questions } });
        } else {
            alert(data.message || "Quiz not found!");
        }
    } catch (err) {
        console.error("Join error:", err);
    }
};
  const [formData, setFormData] = useState({
    amount: 10,
    category: 9,
    difficulty: 'easy'
  });

  useEffect(() => {
    fetch('https://opentdb.com/api_category.php')
      .then(res => res.json())
      .then(data => setCategories(data.trivia_categories || []))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStart = () => {
    setQuizSettings(formData);
    navigate('/quiz'); 
  };

  return (
    <div className='container setup-card'>
      <h2>Customize Your Challenge</h2>
      <hr />
      
      <div className='settings-group'>
        <p>Select Difficulty</p>
        <select name="difficulty" value={formData.difficulty} onChange={handleChange}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="">Any Difficulty</option>
        </select>
      </div>

      <div className='settings-group'>
        <p>Number of Questions</p>
        <input 
          type="number" name="amount" min="1" max="20" 
          value={formData.amount} onChange={handleChange} 
        />
      </div>

      <div className='settings-group'>
        <p>Select Category</p> 
        <select name="category" className="category-select" onChange={handleChange}>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className='buttons'>
        <button className='start-btn' onClick={handleStart}>Start Quiz</button>
        <div className="join-container" style={{ width: '250px', marginTop: '10px' }}>
    <button 
        className='start-btn' 
        onClick={() => setIsJoinVisible(!isJoinVisible)}
        style={{ marginBottom: isJoinVisible ? '10px' : '0' }}
    >
        {isJoinVisible ? 'Cancel' : 'Join Custom Quiz'}
    </button>

    {isJoinVisible && (
        <div className="join-dropdown" style={{ display: 'flex', gap: '10px', animation: 'fadeIn 0.3s' }}>
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
                style={{
                    padding: '0 20px',
                    backgroundColor: '#e2ff3d',
                    color: '#1a0b2e',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                JOIN
            </button>
        </div>
    )}
</div>
        {/* <button className='start-btn' onClick={() => navigate('/create')}>Create Your Quiz </button> */}
        <button className='start-btn' onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  );
};

export default Setup;