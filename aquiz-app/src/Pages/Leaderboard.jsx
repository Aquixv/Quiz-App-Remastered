import React from 'react'
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Leaderboard.css'
import API_BASE_URL from './config';

const Leaderboard = () => {

const location = useLocation();
const [currentCategory, setCurrentCategory] = useState(location.state?.initialCategory || '9');
const [scores, setScores] = useState([]);
 const [apiCategories, setApiCategories] = useState([]);
  

useEffect(() => {
  fetch('https://opentdb.com/api_category.php')
    .then(res => res.json())
    .then(data => {
      setApiCategories(data.trivia_categories);
    })
    .catch(err => console.error("Error fetching API categories:", err));
}, []);

useEffect(() => {
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leaderboard/${currentCategory}`);
      const data = await res.json();
      setScores(data);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
  };
  fetchScores();
}, [currentCategory]);

 return (
  <div className="bg-deep-purple min-h-screen p-6 text-lavender-light">
    <h1 className="text-3xl font-bold text-white mb-6">Hall of Fame</h1>
    
    <select 
      className="quiz-select-dark mb-8"
      value={currentCategory}
      onChange={(e) => setCurrentCategory(e.target.value)}
    >
      {apiCategories.map(cat => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>

    <div className="space-y-4">
      {scores.length > 0 ? (
        scores.map((s, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-glass-border shadow-lg">
            <div className={`text-2xl font-black ${i === 0 ? 'text-neon-yellow' : 'text-electric-violet/50'}`}>
              #{i + 1}
            </div>
            <div className="size-12 rounded-full overflow-hidden bg-electric-violet/20">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} alt="avatar" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-lg">{s.username}</p>
              <p className="text-xs text-lavender-light/40">Attempted {s.totalQuestions} questions</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-neon-yellow">{s.score}</p>
              <p className="text-[10px] uppercase font-bold tracking-tighter">Points</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-20 opacity-30">
          <span className="material-symbols-outlined text-6xl mb-2">sentiment_dissatisfied</span>
          <p>No one has conquered this category yet.</p>
        </div>
      )}
    </div>
    <nav className="fixed bottom-0 left-0 right-0 bg-deep-purple/80 backdrop-blur-xl border-t border-glass-border px-4 pb-6 pt-2 z-20">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center gap-1 text-lavender-light/40">
              <span className="material-symbols-outlined">home</span>
              <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
            </Link>
            <button className="flex flex-col items-center gap-1 text-neon-yellow">
              <Link to="/leaderboard"><span className="material-symbols-outlined">leaderboard</span>
              <p className="text-[10px] font-medium uppercase tracking-wider">Leaderboard</p></Link>
            </button>
            <button className="flex flex-col items-center gap-1 text-lavender-light/40">
            <Link to="/profile">
              <span className="material-symbols-outlined">person</span>
              <p className="text-[10px] font-medium uppercase tracking-wider">Profile</p>
              </Link>
            </button>
          </div>
        </nav>
  </div>
);
};

export default Leaderboard