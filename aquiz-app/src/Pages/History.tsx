import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Score } from '../quiz';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
interface HistoryProps {
    getUserHistory: Score[];
}
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
  '31': 'Anime & Manga',
  '32': 'Entertainment: Cartoon & Animations'
};

const FETCH_USER_HISTORY = gql`
  query GetUserHistory($userId: ID!) {
    getUserHistory(userId: $userId) {
      score
      totalQuestions
      userId
      categoryId
      createdAt
      quizId {
        creatorId
        creatorName
        quizTitle
      }
    }
  }
`;

const MyHistory = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const localUser = userString ? JSON.parse(userString) : null;
    const userId = localUser?.id || localUser?._id;
    const { data, loading } = useQuery<HistoryProps>(FETCH_USER_HISTORY, {
        variables: { userId },
        skip: !userId, 
    });

    const history: Score[] = data?.getUserHistory 
        ? [...data.getUserHistory].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
  
    return (
        <div className="bg-deep-purple min-h-screen p-6 text-lavender-light">
            <header className="flex items-center mb-8">
                <button 
                    onClick={() => navigate('/profile')} 
                    className="material-symbols-outlined mr-4 hover:text-white transition-colors"
                >
                    arrow_back
                </button>
                <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">Quiz History</h1>
            </header>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-20 opacity-50">Loading your history...</div>
                ) : history.length > 0 ? (
                    history.map((item, index) => (
                        <div key={index} className="glass-card p-5 rounded-2xl border border-white/10 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-full bg-electric-violet/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-electric-violet">sports_esports</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">
                                        {item.quizId?.quizTitle || `${categoryMap[item.categoryId || '9']} Trivia`}
                                    </h3>
                                    <p className="text-xs text-lavender-light/40 mt-1 uppercase tracking-widest">
                                        {new Date(parseInt(item.createdAt)).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <span className="text-neon-yellow font-black text-xl">+{item.score}</span>
                                <span className="text-[10px] text-lavender-light/50 font-bold tracking-widest uppercase">Points</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 opacity-30 italic">
                        <span className="material-symbols-outlined block text-4xl mb-2">history</span>
                        No games played yet. Get out there!
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyHistory;