import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
const FETCH_PROFILE = gql`
  query GetUserProfile($getUserId: ID!) {
    getUser(id: $getUserId) {
      username
      totalPoints
    }
  }
`;

const FETCH_USER_HISTORY = gql`
  query GetUserHistory($userId: ID!) { 
    getUserHistory(userId: $userId) {
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
   calculatedTotalPoints: number;

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
const categoryMap: Record<string, string> = {
  '9': 'General Knowledge', '10': 'Entertainment: Books', '11': 'Entertainment: Film',
  '12': 'Entertainment: Music', '15': 'Entertainment: Video Games', '17': 'Science & Nature',
  '18': 'Science: Computers', '21': 'Sports', '23': 'History', '31': 'Anime & Manga'
};

const Userprofiles = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const { data: profileData, loading: profileLoading, error: profileError } = useQuery<ProfileResponse>(FETCH_PROFILE, {
    variables: { getUserId: userId },
    skip: !userId, 
  });

  const { data: historyData, loading: historyLoading } = useQuery<HistoryResponse>(FETCH_USER_HISTORY, {
    variables: { userId: userId },
    skip: !userId,
  });
  console.log("1. URL Param (userId):", userId);
console.log("2. Profile Data:", profileData);
console.log("3. Profile Error:", profileError);

  const getPlayerRankInfo = (points: number) => {
    if (points >= 1000) return { title: "First Class!", color: "text-neon-yellow", icon: "military_tech" };
    if (points >= 500) return { title: "Scholar!!", color: "text-electric-violet", icon: "workspace_premium" };
    if (points >= 200) return { title: "Apprentice!", color: "text-lavender-light", icon: "school" };
    if (points >= 50) return { title: "Houseboy", color: "text-blue-400", icon: "auto_stories" };
    return { title: "Novice", color: "text-lavender-light/40", icon: "school" };
  };

  if (profileLoading || historyLoading) return <div className="min-h-screen bg-deep-purple flex items-center justify-center text-white animate-pulse">Loading Profile...</div>;
  if (profileError || !profileData?.getUser) return <div className="min-h-screen bg-deep-purple flex items-center justify-center text-red-400">Player not found.</div>;

  const userStats = profileData.getUser;
  const matchHistory = historyData?.getUserHistory || [];
  
  const calculatedTotalPoints = matchHistory.reduce((sum: number, match: any) => sum + match.score, 0);
  const rank = getPlayerRankInfo(calculatedTotalPoints);

  return (
    <div className="bg-deep-purple min-h-screen p-6 font-display text-lavender-light pb-10">
      
      <button onClick={() => navigate(-1)} className="text-white hover:text-neon-yellow transition-colors mt-4">
        <span className="material-symbols-outlined text-3xl">arrow_back</span>
      </button>

      <div className="max-w-md mx-auto pt-4">
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
          <div className="glass-card p-6 rounded-3xl text-center border border-white/5 bg-white/5">
            <span className="text-electric-violet text-3xl font-black block">{calculatedTotalPoints.toLocaleString()}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Total Points</span>
          </div>
          <div className="glass-card p-6 rounded-3xl text-center border border-white/5 bg-white/5">
            <span className="text-electric-violet text-3xl font-black block">{matchHistory.length}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Quizzes Played</span>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-lavender-light/40 mb-4 ml-1">Recent Activity</h3>
          <div className="space-y-3">
            {matchHistory.length > 0 ? (
              matchHistory.slice(0, 10).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
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
              <p className="text-center py-6 text-sm text-lavender-light/20 italic">No games played yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 

export default Userprofiles;