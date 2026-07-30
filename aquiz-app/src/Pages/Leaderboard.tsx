import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Leaderboard.css';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
}

const GET_CATEGORY_LEADERBOARD = gql`
  query GetLeaderboardByCategory($categoryId: String!) {
    getLeaderboardByCategory(categoryId: $categoryId) {
      _id
      userId
      username
      score
      totalQuestions
    }
  }
`;
const Leaderboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentCategory, setCurrentCategory] = useState(location.state?.initialCategory || '9');
    const [apiCategories, setApiCategories] = useState<Category[]>([]);

    const { data, loading } = useQuery<any>(GET_CATEGORY_LEADERBOARD, {
        variables: { categoryId: String(currentCategory)},
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        fetch('https://opentdb.com/api_category.php')
            .then(res => res.json())
            .then(data => {
                setApiCategories(data.trivia_categories);
            })
            .catch(err => console.error("Error fetching API categories:", err));
    }, []);

    const getUniqueTopScores = (allScores: any[]) => {
        if (!allScores) return [];
        
        const userMap = new Map<string, any>();

        allScores.forEach(scoreItem => {
            const name = scoreItem.username;
            const existingScore = userMap.get(name);
            if (!existingScore || scoreItem.score > existingScore.score) {
                userMap.set(name, scoreItem);
            }
        });
        
        return Array.from(userMap.values()).sort((a, b) => b.score - a.score);
    };

    const displayScores = getUniqueTopScores(data?.getLeaderboardByCategory);
    const topThree = displayScores.slice(0, 3);
    const remainingPlayers = displayScores.slice(3, 10);

    return (
        <div className="bg-deep-purple min-h-screen p-6 text-lavender-light pb-32">
            
            <select 
                className="quiz-select-dark mb-8 w-full mt-8"
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
            >
                {apiCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            {loading ? (
                <div className="text-center py-20 opacity-50 animate-pulse">
                    Loading Rankings...
                </div>
            ) : displayScores.length > 0 ? (
                <div className="space-y-8">
                    <div className="flex justify-center items-end gap-4 mt-8">
                        {topThree[1] && (
                            <div className="flex flex-col items-center">
                                <img onClick={() => navigate(`/userprofile/${topThree[1].userId}`)} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[1].username}`} className="size-12 rounded-full mb-2 z-10 bg-white/10" alt="2nd" />
                                <span className="font-bold text-white bg-white/20 px-2 rounded-md mb-2 text-sm">{topThree[1].username}</span>
                                <span className="text-[10px] text-lavender-light/50 uppercase tracking-wider">{topThree[1].totalQuestions} Questions</span>
                                            <span className="font-black text-neon-yellow text-lg">{topThree[1].score} pts</span>
                                <div className="w-24 h-32 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-xl flex justify-center pt-4 shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                                    <span className="text-5xl font-black text-white/30">2</span>
                                </div>
                            </div>
                        )}
                        {topThree[0] && (
                            <div className="flex flex-col items-center">
                                <span className="text-3xl mb-1">👑</span>
                                <img onClick={() => navigate(`/userprofile/${topThree[0].userId}`)} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[0].username}`} className="size-16 rounded-full mb-2 z-10 border-4 border-yellow-400 bg-white/10" alt="1st" />
                                <span className="font-bold text-white bg-white/20 px-2 rounded-md mb-2">{topThree[0].username}</span>
                                <span className="text-[10px] text-lavender-light/50 uppercase tracking-wider">{topThree[0].totalQuestions} Questions</span>
                                            <span className="font-black text-neon-yellow text-lg">{topThree[0].score} pts</span>
                                <div className="w-28 h-44 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-xl flex justify-center pt-4 shadow-[0_0_20px_rgba(250,204,21,0.6)] z-0 relative">
                                    <span className="text-6xl font-black text-white/30">1</span>
                                </div>
                            </div>
                        )}
                        {topThree[2] && (
                            <div className="flex flex-col items-center">
                                <img onClick={() => navigate(`/userprofile/${topThree[2].userId}`)} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topThree[2].username}`} className="size-12 rounded-full mb-2 z-10 bg-white/10" alt="3rd" />
                                <span className="font-bold text-white bg-white/20 px-2 rounded-md mb-2 text-sm">{topThree[2].username}</span>
                                            <span className="text-[10px] text-lavender-light/50 uppercase tracking-wider">{topThree[2].totalQuestions} Questions</span>
                                            <span className="font-black text-neon-yellow text-lg">{topThree[2].score} pts</span>
                                <div className="w-24 h-24 bg-gradient-to-t from-fuchsia-600 to-fuchsia-400 rounded-t-xl flex justify-center pt-4 shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                                    <span className="text-5xl font-black text-white/30">3</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {remainingPlayers.length > 0 && (
                        <div>
                            {remainingPlayers.map((player, index) => (
                                <div key={player._id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-white/50 w-6 text-center">{index + 4}</span> 
                                        <img onClick={() => navigate(`/userprofile/${player.UserId}`)} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`} className="size-10 rounded-full bg-electric-violet/20" alt="avatar" />
                                        <div>
                                            <span className="font-bold text-white block">@{player.username}</span>
                                            <span className="text-[10px] text-lavender-light/50 uppercase tracking-wider">{player.totalQuestions} Questions</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-neon-yellow text-lg">{player.score} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 opacity-30">
                    <span className="material-symbols-outlined text-6xl mb-2">sentiment_dissatisfied</span>
                    <p>No one has conquered this category yet.</p>
                </div>
            )}
            <nav className="fixed bottom-0 left-0 right-0 bg-deep-purple/80 backdrop-blur-xl border-t border-glass-border px-4 pb-6 pt-2 z-20">
                <div className="flex justify-around">
                    <Link to="/" className="flex flex-col items-center gap-1 text-lavender-light/40 hover:text-neon-yellow transition-colors">
                        <span className="material-symbols-outlined">home</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
                    </Link>
                    <Link to="/leaderboard" className="flex flex-col items-center gap-1 text-neon-yellow">
                        <span className="material-symbols-outlined">leaderboard</span>
                        <p className="text-[10px] font-medium uppercase tracking-wider">Leaderboard</p>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-lavender-light/40 hover:text-neon-yellow transition-colors">
                        <span className="material-symbols-outlined">person</span>
                        <p className="text-[10px] font-medium uppercase tracking-wider">Profile</p>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default Leaderboard;