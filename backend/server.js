const express = require('express');
const cors = require('cors');
const { AgnoMCP, Agent } = require('@agno/mcp');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize Agno MCP
const mcp = new AgnoMCP({ apiKey: process.env.AGNO_API_KEY });

// Define Agents
const mrsBeenAgent = new Agent({
    name: 'MrsBeen',
    purpose: 'The primary user-facing AI guide. Delivers lessons, provides encouragement, updates user progress, and simulates community posts.',
    tools: ['deliverLesson', 'updateUserData', 'postSocialMessage', 'checkStreakMilestone'],
    memory: true
});

const socialAnalysisAgent = new Agent({
    name: 'SocialAnalysis',
    purpose: 'Analyzes fetched X posts to identify relevant topics for lesson generation.',
    tools: ['fetchAndAnalyzeXPostsForTopics'],
    memory: false
});

const courseGeneratorAgent = new Agent({
    name: 'CourseGenerator',
    purpose: 'Generates personalized lesson content based on identified topics and user progress.',
    tools: ['generateLessonContent'],
    memory: true
});

// Add agents to MCP
mcp.addAgent(mrsBeenAgent);
mcp.addAgent(socialAnalysisAgent);
mcp.addAgent(courseGeneratorAgent);

// API Routes
app.get('/api/lesson', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    try {
        console.log(`GET /api/lesson for userId: ${userId}`);
        // Initialize user data if first time
        let userData = mcp.memory.get(`user_${userId}`);
        if (!userData) {
            userData = { userId, streak: 0, lessonsCompleted: {}, currentLesson: null };
            mcp.memory.set(`user_${userId}`, userData);
        }

        const topics = await socialAnalysisAgent.call('fetchAndAnalyzeXPostsForTopics', userId);
        const newLesson = await courseGeneratorAgent.call('generateLessonContent', userId, topics);
        const currentStreak = await mrsBeenAgent.call('deliverLesson', userId, newLesson);

        res.json({ lesson: newLesson, streak: currentStreak, message: "Here's your lesson from Mrs. Been!" });
    } catch (error) {
        console.error(`Error in /api/lesson for ${userId}: ${error.message}`, error.stack);
        res.status(500).json({ error: 'Failed to fetch lesson. Mrs. Been is a bit busy!' });
    }
});

app.post('/api/answer', async (req, res) => {
    const { userId, answer } = req.body;
    if (!userId || answer === undefined) return res.status(400).json({ error: 'userId and answer are required' });

    try {
        console.log(`POST /api/answer for userId: ${userId} with answer: "${answer}"`);
        let userData = mcp.memory.get(`user_${userId}`);
        if (!userData || !userData.currentLesson) {
            return res.status(400).json({ error: 'No current lesson found for user. Please fetch a lesson first.' });
        }

        const { currentLesson } = userData;
        const isCorrect = currentLesson.answer.toLowerCase() === answer.toLowerCase();
        let responseMessage = '';
        let nextLessonData = null;

        if (isCorrect) {
            responseMessage = "Correct! Well done! Mrs. Been is proud! 🐝";
            userData.lessonsCompleted[currentLesson.topic] = Math.max(userData.lessonsCompleted[currentLesson.topic] || 0, currentLesson.lessonDay);

            const milestone = await mrsBeenAgent.call('checkStreakMilestone', userId, userData.streak);
            if (milestone.isMilestone) {
                responseMessage += ` ${milestone.message}`;
                await mrsBeenAgent.call('postSocialMessage', {
                    platform: 'X',
                    userId,
                    message: `@${userId} is on a ${userData.streak}-day streak and aced ${currentLesson.topic}! #BravedBalajis via Mrs. Been AI`
                });
            }
            
            // Fetch next lesson
            const topics = await socialAnalysisAgent.call('fetchAndAnalyzeXPostsForTopics', userId);
            const nextGeneratedLesson = await courseGeneratorAgent.call('generateLessonContent', userId, topics);
            await mrsBeenAgent.call('deliverLesson', userId, nextGeneratedLesson);
            nextLessonData = nextGeneratedLesson;
            userData = mcp.memory.get(`user_${userId}`);
        } else {
            responseMessage = "Not quite! Give it another thought, or try a different option. You can do it! 🐝";
        }
        
        await mrsBeenAgent.call('updateUserData', userId, userData);

        res.json({
            correct: isCorrect,
            newStreak: userData.streak,
            message: responseMessage,
            nextLesson: nextLessonData
        });

    } catch (error) {
        console.error(`Error in /api/answer for ${userId}: ${error.message}`, error.stack);
        res.status(500).json({ error: 'Failed to process answer. Mrs. Been needs a honey break!' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`BravedBalajis MVP Backend listening on port ${PORT}`);
    console.log(`Mrs. Been AI is buzzing and ready!`);
}); 