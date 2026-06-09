import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Leaderboard.css';
import { Quiz } from '../quiz';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
const GET_CATEGORY_LEADERBOARD = gql`
  query GetLeaderboardByCategory($categoryId: String!) {
    getLeaderboardByCategory(categoryId: $categoryId) {
      _id
      username
      score
      totalQuestions
    }
  }
`;

const Leaderboard = () => {
    const location = useLocation();
    const [currentCategory, setCurrentCategory] = useState(location.state?.initialCategory || '9');
    const [apiCategories, setApiCategories] = useState<Quiz[]>([]);

    const { data, loading } = useQuery<any>(GET_CATEGORY_LEADERBOARD, {
        variables: { categoryId: currentCategory },
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

            <div className="space-y-4 mb-24">
                {loading ? (
                    <div className="text-center py-20 opacity-50 animate-pulse">
                        Consulting the Hall of Fame...
                    </div>
                ) : displayScores.length > 0 ? (
                    displayScores.map((s, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-glass-border shadow-lg">
                            <div className={`text-2xl font-black ${i === 0 ? 'text-neon-yellow' : 'text-electric-violet/50'}`}>
                                #{i + 1}
                            </div>
                            
                            <div className="size-12 rounded-full overflow-hidden bg-electric-violet/20">
                                <img alt={s.username} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} />
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-lg font-bold text-white">@{s.username}</p>
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