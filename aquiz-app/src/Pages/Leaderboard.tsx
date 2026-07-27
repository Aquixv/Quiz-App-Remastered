import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Leaderboard.css';
// import { Quiz } from '../quiz';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

interface Category {
  id: number;
  name: string;
}

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

    return (
        <div className="bg-deep-purple min-h-screen p-6 text-lavender-light">
            <h1 className="text-md font-bold text-white mb-6 pvx">LeaderBoards<br/><svg fill="#fcfcfc" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="64px" height="24px" viewBox="0 0 31.80 31.80" xmlSpace="preserve" stroke="#fcfcfc" stroke-width="0.00031800999999999997"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <polygon points="20.961,28.227 31.082,28.227 31.082,21.879 20.961,21.879 20.961,18.467 10.84,18.467 10.84,25.291 0.719,25.291 0.719,28.227 10.84,28.227 "></polygon> <circle cx="16.291" cy="3.943" r="2.32"></circle> <polygon points="14.983,17.954 14.991,18.105 16.016,18.105 16.016,17.148 16.016,17.045 16.016,12.915 16.6,12.915 16.6,17.045 16.6,17.148 16.6,18.105 17.625,18.105 17.633,17.954 18.559,18.105 19.352,18.105 19.352,17.247 18.419,17.045 18.26,17.045 18.26,12.915 18.26,12.526 18.26,11.997 18.408,11.997 18.698,8.196 21.496,3.325 20.284,3.308 18.238,6.612 17.135,6.612 16.25,7.639 15.395,6.612 13.524,6.964 13.394,11.132 14.19,11.132 14.234,11.997 14.355,11.997 14.355,12.526 14.355,12.915 14.355,17.045 14.196,17.045 13.265,17.247 13.265,18.105 14.057,18.105 "></polygon> <circle cx="26.259" cy="7.655" r="2.293"></circle> <polygon points="24.934,21.502 24.941,21.65 25.954,21.65 25.954,20.706 25.954,20.604 25.954,16.522 26.531,16.522 26.531,20.604 26.531,20.706 26.531,21.65 27.544,21.65 27.552,21.502 28.467,21.65 29.25,21.65 29.25,20.803 28.33,20.604 28.172,20.604 28.172,16.522 28.172,16.136 28.172,15.614 28.292,15.614 28.334,14.759 29.122,14.759 28.993,10.645 27.145,10.293 26.299,11.308 25.425,10.293 23.402,10.645 23.402,14.759 24.124,14.759 24.168,15.614 24.312,15.614 24.312,16.136 24.312,16.522 24.312,20.604 24.156,20.604 23.234,20.803 23.234,21.65 24.02,21.65 "></polygon> <circle cx="5.796" cy="10.933" r="2.293"></circle> <polygon points="4.47,24.779 4.479,24.93 5.491,24.93 5.491,23.984 5.491,23.882 5.491,19.8 6.068,19.8 6.068,23.882 6.068,23.984 6.068,24.93 7.081,24.93 7.089,24.779 8.004,24.93 8.787,24.93 8.787,24.081 7.867,23.882 7.709,23.882 7.709,19.8 7.709,19.414 7.709,18.893 7.829,18.893 7.872,18.036 8.659,18.036 8.53,13.923 6.682,13.571 5.836,14.585 4.962,13.571 2.939,13.923 2.939,18.036 3.661,18.036 3.705,18.893 3.85,18.893 3.85,19.414 3.85,19.8 3.85,23.882 3.693,23.882 2.772,24.081 2.772,24.93 3.556,24.93 "></polygon> <rect y="28.729" width="31.801" height="1.449"></rect> </g> </g> </g></svg></h1>
            
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
                        Loading...
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