import express from 'express'
const app = express();
import cors from 'cors'
require('dotenv').config(); 
import './connection'
import Quiz from './models/Quiz';
import Score from './models/Score';
import User from './models/User';
import generateJoinCode from './generator';


app.use(cors({
  origin: ["http://localhost:5173", ""],
  credentials: true
}));
app.use(express.json());

const port = process.env.PORT || 1500; 


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ username: user.username, id: user._id });
    } else {
        res.status(401).json({ error: "Invalid credentials." });
    }
});

app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = new User({ username, password, totalPoints: 0 });
        await newUser.save();
        res.status(201).json({ message: "User created!", user: { username: newUser.username, id: newUser._id } });
    } catch (err) {
        res.status(400).json({ error: "Username already taken." });
    }
});


app.post('/api/quizzes', async (req, res) => {
    try {
        const { quizTitle, creatorName, questions, creatorId } = req.body;
        
        const newQuiz = new Quiz({
            quizTitle,
            creatorName,
            creatorId, 
            joinCode: generateJoinCode(),
            questions
        });

        const savedQuiz = await newQuiz.save();
        res.status(201).json(savedQuiz); 
    } catch (err) {
        res.status(500).json({ error: "Failed to create quiz." });
    }
});

app.get('/api/quizzes/join/:code', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ joinCode: req.params.code.toUpperCase() });
        if (!quiz) return res.status(404).json({ message: "Quiz not found!" });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ error: "Server error during join." });
    }
});


app.post('/api/scores', async (req, res) => {
    try {
        const { userId, score, quizId, categoryId, totalQuestions } = req.body;
        

        const newScore = new Score({ userId, score, quizId, categoryId, totalQuestions });
        await newScore.save();

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $inc: { totalPoints: score } 
            });
        }

        res.status(201).json({ message: "Points logged! 🏆" });
    } catch (err) {
        console.error("Score Error:", err);
        res.status(500).json({ error: "Failed to log points." });
    }
});

app.get('/api/users/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find().sort({ totalPoints: -1 }).limit(10); 
        res.json(topUsers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch top users" });
    }
});

app.get('/api/leaderboard/:categoryId', async (req, res) => {
    try {
        const topScores = await Score.find({ categoryId: req.params.categoryId }) 
            .sort({ score: -1 })
            .limit(10)
            .populate('userId', 'username'); 
        res.json(topScores);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(404).json({ error: "User not found" });
    }
});

app.get('/api/scores/user/:userId', async (req, res) => {
    try {
        const history = await Score.find({ userId: req.params.userId })
            .populate('quizId', 'quizTitle')
            .sort({ createdAt: -1 }) 
            .limit(10); 
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

app.get('/api/my-quizzes/:userId', async (req, res) => {
    try {
        const quizzes = await Quiz.find({ creatorId: req.params.userId });
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch your quizzes" });
    }
});

app.delete('/api/quizzes/:id', async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: "Quiz deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});


app.get('/health', (req, res) => {
    res.status(200).send('Server is alive and kicking! 🚀');
});

app.get('/', (req, res) => {
    res.send('QuizMaster API Live');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});