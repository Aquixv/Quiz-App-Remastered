import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql} from '@apollo/client';
import { useQuery } from '@apollo/client/react';

const GET_CUSTOM_LEADERBOARD = gql`
  query GetCustomQuizLeaderboard($quizId: ID!) {
    getCustomQuizLeaderboard(quizId: $quizId) {
      _id
      username
      score
      totalQuestions
    }
  }
`;
interface CustomQuizLB {
  getCustomQuizLeaderboard: {
    _id: string;
    username: string;
    score: number;
    totalQuestions: number;
  }[];
}
const CustomLeaderboard = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const { data, loading, error } = useQuery<CustomQuizLB>(GET_CUSTOM_LEADERBOARD, {
        variables: { quizId },
        fetchPolicy: 'network-only',
    });

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
    if (error) return <div className="text-red-400 text-center mt-20">Failed to load leaderboard.</div>;

    const displayScores = data?.getCustomQuizLeaderboard || [];

    return (
        <div className="bg-deep-purple min-h-screen p-6 text-lavender-light">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-white hover:text-neon-yellow transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-3xl font-bold text-white">Custom Quiz Rankings</h1>
            </div>

            <div className="space-y-4">
                {displayScores.length > 0 ? (
                    displayScores.map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-glass-border shadow-lg">
                            <div className={`text-2xl font-black ${i === 0 ? 'text-neon-yellow' : 'text-electric-violet/50'}`}>
                                #{i + 1}
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-lg font-bold text-white">@{s.username}</p>
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
                        <p>No one has challenged this custom quiz yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomLeaderboard;