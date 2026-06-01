import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const localUser = JSON.parse(localStorage.getItem('user'));
  const [history, setHistory] = useState([]);

useEffect(() => {
    if (localUser) {
        fetch(`${API_BASE_URL}/api/scores/users/${localUser.id}`)
            .then(res => res.json())
            .then(data => setHistory(data));
    }
}, []);
  
  const getPlayerRankInfo = (points) => {
  if (points >= 50000) return { title: "Grandmaster", color: "text-neon-yellow", icon: "military_tech" };
  if (points >= 25000) return { title: "Elite Scholar", color: "text-electric-violet", icon: "workspace_premium" };
  if (points >= 10000) return { title: "Brainiac", color: "text-lavender-light", icon: "psychology" };
  if (points >= 5000) return { title: "Knowledge Seeker", color: "text-blue-400", icon: "auto_stories" };
  return { title: "Novice", color: "text-lavender-light/40", icon: "school" };
};
const rank = getPlayerRankInfo(userData?.totalPoints || 0);

if (!localUser) {
    return (
      <div className="bg-deep-purple min-h-screen flex items-center justify-center p-6 text-center">
        <div className="glass-card p-10 rounded-3xl max-w-md w-full border border-electric-violet/20">
          <span className="material-symbols-outlined text-7xl text-electric-violet mb-4">person_add</span>
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Profile</h2>
          <p className="text-lavender-light/60 mb-8">
            Create an account to track your scores, climb the leaderboard, and save your custom quizzes forever.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full h-14 bg-neon-yellow text-deep-purple font-bold rounded-xl shadow-lg shadow-neon-yellow/20"
          >
            Login or Sign Up
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!localUser) {
      navigate('/'); 
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${localUser.id}`)
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('active_quiz'); 
    navigate('/');
    window.location.reload();
  };

  if (!userData) return <div className="min-h-screen bg-deep-purple flex items-center justify-center text-white">Loading Profile...</div>;

  return (
    <div>
    <div className="bg-deep-purple min-h-screen p-6 font-display text-lavender-light">
      <div className="max-w-md mx-auto pt-10">
        <div className="flex flex-col items-center mb-10">
          <div className="size-32 rounded-full border-4 border-electric-violet p-1 mb-4">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} 
              className="rounded-full bg-white/10" 
              alt="avatar"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">@{userData.username}</h1>
<div className={`flex items-center gap-2 font-bold ${rank.color}`}>
  <span className="material-symbols-outlined text-sm">{rank.icon}</span>
  {rank.title}
</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-6 rounded-3xl text-center border border-white/5">
            <span className="text-neon-yellow text-3xl font-black block">{userData?.totalPoints?.toLocaleString() || '0'}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Total Points</span>
          </div>
          <div className="glass-card p-6 rounded-3xl text-center border border-white/5">
            <span className="text-electric-violet text-3xl font-black block">#{userData.rank || '??'}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50"> Rank</span>
          </div>
        </div>

        <div className="space-y-3">
            <div className="mt-8">
  <h3 className="text-sm font-bold uppercase tracking-widest text-lavender-light/40 mb-4 ml-1">Recent Activity</h3>
  <div className="space-y-3">
    {history.length > 0 ? (
      history.map((item, i) => (
  <div key={i}>
    <p>{item.quizId?.quizTitle || "External Quiz"}</p> 
    <p>{item.score} pts</p>
  </div>
))
    ) : (
      <p className="text-center py-6 text-sm text-lavender-light/20 italic">No games played yet. Go test yourself!</p>
    )}
  </div>
</div>
          <button 
            onClick={() => navigate('/myquizzes')}
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-glass-border hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-electric-violet">edit_note</span>
              <span className="font-bold">My Custom Quizzes</span>
            </div>
            <span className="material-symbols-outlined opacity-30">chevron_right</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold mt-10 hover:bg-red-500/20 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
      </div>
      <nav className="bottom-0 left-0 right-0 bg-deep-purple/80 backdrop-blur-xl border-t border-glass-border px-4 pb-6 pt-2 z-20">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center gap-1 text-lavender-light/40">
              <span className="material-symbols-outlined">home</span>
              <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
            </Link>
            <button className="flex flex-col items-center gap-1 text-lavender-light/40">
              <Link to="/leaderboard"><span className="material-symbols-outlined">leaderboard</span>
              <p className="text-[10px] font-medium uppercase tracking-wider">Leaderboard</p></Link>
            </button>
            <button className="flex flex-col items-center gap-1 text-neon-yellow">
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

export default Profile;