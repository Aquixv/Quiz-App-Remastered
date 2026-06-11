import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const categoryMap: Record<string, string> = {
  '9': 'General Knowledge',
  '10': 'Entertainment: Books',
  '11': 'Entertainment: Film',
  '12': 'Entertainment: Music',
  '13': 'Entertainment: Musicals & Theatres',
  '14': 'Entertainment: Television',
  '15': 'Entertainment: Video Games',
  '16': 'Entertainment: Board Games',
  '17': 'Science & Nature',
  '18': 'Science: Computers',
  '19': 'Science: Mathematics',
  '20': 'Mythology',
  '21': 'Sports',
  '22': 'Geography',
  '23': 'History',
  '24': 'Politics',
  '25': 'Art',
  '26': 'Celebrities',
  '27': 'Animals',
  '28': 'Vehicles',
  '29': 'Entertainment: Comics',
  '30': 'Science: Gadgets',
  '31': 'Entertainment: Japanese Anime & Manga',
  '32': 'Entertainment: Cartoon & Animations'
};

const FETCH_PROFILE = gql`
  query GetUserProfile($getUserId: ID!) {
    getUser(id: $getUserId) {
      totalPoints
      username
    }
  }
`;

const FETCH_USER_HISTORY = gql`
  query GetUserHistory($userId: ID!) { 
    getUserHistory(userId: $userId) {
      userId
      username
      totalQuestions
      score
      categoryId
      createdAt
      quizId {
        quizTitle
      }
    }
  }
`;

interface ProfileResponse {
  getUser: {
    username: string;
    totalPoints: number;
  };
}

interface HistoryItem {
  userId: string;
  username: string;
  totalQuestions: number;
  score: number;
  categoryId: string;
  createdAt: string;
  quizId?: {
    quizTitle: string;
  } | null;
}

interface HistoryResponse {
  getUserHistory: HistoryItem[];
}

const Profile = () => {
  const navigate = useNavigate();
  
  //  Auth variables
  const userString = localStorage.getItem('user');
  const localUser = userString ? JSON.parse(userString) : null;
  const userId = localUser?.id || localUser?._id;

  // 3. Fire profile data query
  const { data: profileData, loading: profileLoading } = useQuery<ProfileResponse>(FETCH_PROFILE, {
    variables: { getUserId: userId },
    skip: !userId, 
  });

  // 4. Fire match history data query
  const { data: historyData, loading: historyLoading } = useQuery<HistoryResponse>(FETCH_USER_HISTORY, {
    variables: { userId: userId },
    skip: !userId,
  });

  const getPlayerRankInfo = (points: number) => {
    if (points >= 1000) return { title: "First Class!", color: "text-neon-yellow", icon: "military_tech" };
    if (points >= 500) return { title: "Scholar!!", color: "text-electric-violet", icon: "workspace_premium" };
    if (points >= 200) return { title: "Apprentice!", color: "text-lavender-light", icon: "school" };
    if (points >= 50) return { title: "Houseboy", color: "text-blue-400", icon: "auto_stories" };
    return { title: "Novice", color: "text-lavender-light/40", icon: "school" };
  };

  if (!localUser || !userId) {
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
  const isPageLoading = profileLoading || historyLoading;
  if (isPageLoading) {
    return <div className="min-h-screen bg-deep-purple flex items-center justify-center text-white">Loading Profile...</div>;
  }

  const userStats = profileData?.getUser;
  const matchHistory = historyData?.getUserHistory || [];
  const rank = getPlayerRankInfo(userStats?.totalPoints || 0);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    localStorage.removeItem('active_quiz'); 
    navigate('/');
    window.location.reload();
  };

  if (!userStats) return <div className="min-h-screen bg-deep-purple flex items-center justify-center text-white">Profile data unavailable.</div>;

  return (
    <div className="bg-deep-purple min-h-screen p-6 font-display text-lavender-light pb-32">
      <div className="max-w-md mx-auto pt-10">
        <div className="flex flex-col items-center mb-10">
          <div className="size-32 rounded-full border-4 border-electric-violet p-1 mb-4">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userStats.username}`} 
              className="rounded-full bg-white/10" 
              alt="avatar"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">@{userStats.username}</h1>
          <div className={`flex items-center gap-2 font-bold ${rank.color}`}>
            <span className="material-symbols-outlined text-sm">{rank.icon}</span>
            <span className="text-md">{rank.title}</span> 
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="glass-card p-6 rounded-3xl text-center border border-white/5">
            <span className="text-electric-violet text-3xl font-black block">{userStats.totalPoints.toLocaleString()}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Total Points</span>
          </div>
          <div className="glass-card p-6 rounded-3xl text-center border border-white/5">
            <span className="text-electric-violet text-3xl font-black block">{matchHistory.length}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Quizzes Played</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-lavender-light/40 mb-4 ml-1">Recent Activity</h3>
            <div className="space-y-3">
              {matchHistory.length > 0 ? (
                matchHistory.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-electric-violet/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-electric-violet">quiz</span>
                      </div>
                      <p className="font-bold text-white text-sm">
                        {item.quizId?.quizTitle || `${categoryMap[item.categoryId || '9']}`}
                      </p>
                    </div>
                    <span className="text-neon-yellow font-black text-sm">+{item.score} pts</span>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-sm text-lavender-light/20 italic">No games played yet. Go test yourself!</p>
              )}
              {matchHistory.length > 3 && (
                <button 
                  onClick={() => navigate('/history')}
                  className="w-full mt-2 py-3 rounded-xl font-bold text-sm text-electric-violet bg-electric-violet/10 hover:bg-electric-violet/20 transition-all"
                >
                  See Full History
                </button>
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

      <nav className="fixed bottom-0 left-0 right-0 bg-deep-purple/80 backdrop-blur-xl border-t border-glass-border px-4 pb-6 pt-2 z-20">
        <div className="flex justify-around">
          <Link to="/" className="flex flex-col items-center gap-1 text-lavender-light/40 hover:text-neon-yellow transition-colors">
            <span className="material-symbols-outlined">home</span>
            <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
          </Link>
          <Link to="/leaderboard" className="flex flex-col items-center gap-1 text-lavender-light/40 hover:text-neon-yellow transition-colors">
            <span className="material-symbols-outlined">leaderboard</span>
            <p className="text-[10px] font-medium uppercase tracking-wider">Leaderboard</p>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-neon-yellow">
            <span className="material-symbols-outlined">person</span>
            <p className="text-[10px] font-medium uppercase tracking-wider">Profile</p>
          </Link>
        </div>
      </nav>
    </div>
  );
} 

export default Profile;