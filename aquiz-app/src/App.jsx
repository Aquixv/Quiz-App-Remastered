import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Home from './Pages/Home'
import Setup from './Pages/Setup'
import Quiz from './Pages/Quiz'
import CreateQuiz from './Pages/createQuiz';
import Leaderboard from './Pages/Leaderboard';
import Profile from './Pages/Profile';
import MyQuizzes from './Pages/MyQuizzes';
const App = () => {
  const [quizSettings, setQuizSettings] = useState({
  amount: 10,
  category: 9,
  difficulty: 'easy'
});

return (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/setup" element={<Setup setQuizSettings={setQuizSettings} />} />
      <Route path="/quiz" element={<Quiz {...quizSettings} />} />
      <Route path="/create" element={<CreateQuiz />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/myquizzes" element={<MyQuizzes />} />
    </Routes>
  </BrowserRouter>
);
}
export default App