import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import { User } from '../quiz';
import { QuizSettingsState } from '../App';
import AuthModal from './AuthModal';
import API_BASE_URL from './config';
interface HomeProps {
    setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettingsState>>;
}

const Home = () => {
  const navigate = useNavigate();
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}')?.username || null);
const [topUsers, setTopUsers] = useState<User[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettingsState>({
    amount: 10,
    category: '9', 
    difficulty: 'easy'
  });
  
useEffect(() => {
  const fetchTopScorers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/leaderboard`);
      const data = await response.json();
      setTopUsers(data); 
    } catch (err) {
      console.error("Couldn't fetch leaderboard");
    }
  };
  fetchTopScorers();
}, []);

const categories = [
    { id: '17', icon: 'science', label: 'Science & Nature' },
    { id: '23', icon: 'history_edu', label: 'History' },
    { id: '11', icon: 'movie_filter', label: 'Film & Media' },
    { id: '18', icon: 'computer', label: 'Tech & Code' },
    { id: '21', icon: 'sports_basketball', label: 'Sports' },
    { id: '25', icon: 'palette', label: 'Art' },
    { id: '31', icon: 'auto_awesome', label: 'Anime & Manga' } 
  ];
const handleQuickStart = (categoryId: string) => {
        setQuizSettings({
            amount: 10,
            category: categoryId,
            difficulty: 'medium' 
        });
        navigate('/quiz');
    };
  return (
    <div className="bg-deep-purple text-lavender-light min-h-screen flex flex-col font-display">
      <div className="relative flex h-full w-full flex-col overflow-x-hidden">
        <header className="flex items-center bg-deep-purple/80 backdrop-blur-md p-4 sticky top-0 z-10 border-b border-glass-border">

  <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight tracking-tight flex-1 text-center">
    QuizMaster
  </h2>

  <div className="flex items-center gap-3">
    {user ? (
      <div className="flex flex-col items-end">
        <span className="text-[10px] uppercase font-bold text-lavender-light/40">Player</span>
        <span className="text-sm font-bold text-neon-yellow">@{user}</span>
      </div>
    ) : (
      <button 
        onClick={() => setIsAuthOpen(true)}
        className="text-xs font-bold uppercase text-neon-yellow border border-neon-yellow/30 px-3 py-2 rounded-xl hover:bg-neon-yellow/10 transition-all"
      >
        Login
      </button>
    )}
    <div className="size-10 flex items-center justify-center text-electric-violet">
      <span className="material-symbols-outlined">notifications</span>
    </div>
  </div>
</header>

        <main className="flex-1 pb-24">
          <section className="px-6 pt-8 pb-6 text-center">
            <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Test Your <span className="text-electric-violet">Knowledge</span>
            </h1>
            <p className="text-lavender-light/70 text-sm md:text-base mb-8">
              Challenge yourself with thousands of quizzes across various topics.
            </p>
            
            <div className="w-full aspect-square max-w-[280px] md:max-w-[400px] mx-auto mb-8 bg-gradient-to-br from-electric-violet/30 to-purple-900/40 rounded-3xl flex items-center justify-center relative overflow-hidden border border-white/10 shadow-2xl shadow-purple-950/50">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-electric-violet via-transparent to-transparent"></div>
              <span className="material-symbols-outlined !text-[130px] md:!text-[200px] text-lavender-light opacity-90">psychology</span>
              <div className="absolute top-4 right-8 text-neon-yellow/80">
                <span className="material-symbols-outlined !text-[40px] md:!text-[50px]">lightbulb</span>
              </div>
              <div className="absolute bottom-6 left-8 text-electric-violet">
                <span className="material-symbols-outlined !text-[28px] md:!text-[45px]">auto_stories</span>
              </div>
            </div>

            <div className="flex px-4 justify-center">
              <button 
                onClick={() => navigate('/setup')}
                className="flex w-full max-w-[360px] cursor-pointer items-center justify-center rounded-xl h-14 md:h-20 bg-neon-yellow text-deep-purple text-lg md:text-2xl font-bold shadow-lg shadow-neon-yellow/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start a Quiz
              </button>
            </div>
          </section>

          <section className="px-6 py-4">
            <div className="flex items-center justify-between mb-6 px-2">
  <h3 className="text-2xl font-bold text-white tracking-tight">Categories</h3>
  <button 
    onClick={() => setShowAllCategories(!showAllCategories)}
    className="bg-electric-violet/10 hover:bg-electric-violet/20 px-4 py-2 rounded-full text-electric-violet text-sm font-bold flex items-center gap-2 transition-all"
  >
    {showAllCategories ? 'Show Less' : `See All (${categories.length})`}
    <span className={`material-symbols-outlined !text-xl transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''}`}>
      keyboard_arrow_down
    </span>
  </button>
</div>
            <div className={`grid grid-cols-3 gap-6 transition-all duration-500 overflow-hidden ${showAllCategories ? 'max-h-[1000px]' : 'max-h-[160px]'}`}>
{categories.map((cat, i) => (
  <div 
    key={i} 
    className="flex flex-col items-center gap-3 mb-6 group cursor-pointer"
    onClick={() => handleQuickStart(cat.id)} 
  >
    <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-electric-violet group-hover:bg-electric-violet/20 transition-all">
      <span className="material-symbols-outlined !text-[40px]">{cat.icon}</span>
    </div>
    <span className="text-sm font-bold text-lavender-light/90">{cat.label}</span>
  </div>
))}
</div>
          </section>

          <section className="px-6 py-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Top Total Scorers</h3>
                <span className="material-symbols-outlined text-neon-yellow">emoji_events</span>
              </div>
            <div className="space-y-4">
  {topUsers.length > 0 ? (
    topUsers.map((u, i) => (
      <div key={i} className="flex items-center gap-3 group">
        <div className="size-10 rounded-full bg-electric-violet/20 border border-white/10 overflow-hidden">
          <img alt={u.username} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{u.username}</p>
          <p className="text-xs text-lavender-light/50">{u.totalPoints.toLocaleString()} pts</p>
        </div>
        <div className={`font-bold ${i === 0 ? 'text-neon-yellow' : 'text-electric-violet'}`}>
          #{i + 1}
        </div>
      </div>
    ))
  ) : (
    <p className="text-sm text-lavender-light/30 text-center">No scores yet. Be the first!</p>
  )}
</div>
            </div>
          </section>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-deep-purple/80 backdrop-blur-xl border-t border-glass-border px-4 pb-6 pt-2 z-20">
          <div className="flex justify-around">
            <Link to="/" className="flex flex-col items-center gap-1 text-neon-yellow">
              <span className="material-symbols-outlined">home</span>
              <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
            </Link>
            <button className="flex flex-col items-center gap-1 text-lavender-light/40">
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
          <AuthModal 
  isOpen={isAuthOpen} 
  onClose={() => setIsAuthOpen(false)} 
  onAuthSuccess={(username) => setUser(username)} 
/>
    </div>
  );
  
};

export default Home;