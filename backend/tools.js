const { mcp } = require('./server');

// Mock/in-memory user data if mcp.memory is not persistent across restarts for MVP dev
let userDatabase = {}; // Fallback if mcp.memory isn't persistent for local dev

const tools = {
    fetchAndAnalyzeXPostsForTopics: async (userId) => {
        console.log(`Fetching X posts for userId: ${userId} and analyzing topics via Agno MCP...`);
        try {
            // const tweets = await mcp.fetchXPosts({ userId, count: 5 }); // Example
            const tweets = [`Mock tweet for ${userId}: Balaji's ideas on network states are fascinating! #Bitcoin`, `Another mock: Thinking about how AI impacts decentralization. #AI`]; // MOCK for now
            if (!tweets || tweets.length === 0) {
                console.warn(`No X posts found for userId: ${userId}. Using default topics.`);
                return ['Bitcoin', 'AI']; // Default topics
            }

            const analysisPrompt = `Analyze these tweets: ${tweets.join('; ')}. Extract up to 2 relevant topics from this list: Bitcoin, RWAs, AI, VR/AR, Emotional Intelligence, Decentralization. Return JSON: { "topics": ["topic1", "topic2"] }`;
            const llmResponse = await mcp.callModel({
                model: 'grok', // or another suitable model
                prompt: analysisPrompt,
            });
            const analyzedData = JSON.parse(llmResponse); // Assuming LLM returns stringified JSON
            return analyzedData.topics || ['Bitcoin', 'AI'];
        } catch (error) {
            console.error(`Error in fetchAndAnalyzeXPostsForTopics for ${userId}: ${error.message}`);
            return ['Bitcoin', 'AI']; // Fallback topics
        }
    },

    generateLessonContent: async (userId, topics) => {
        const selectedTopic = topics[Math.floor(Math.random() * topics.length)];
        const userData = mcp.memory.get(`user_${userId}`) || { lessonsCompleted: {} };
        const lessonDay = (userData.lessonsCompleted[selectedTopic] || 0) + 1;

        console.log(`Generating lesson for topic: ${selectedTopic}, day: ${lessonDay} for userId: ${userId}`);
        const lessonPrompt = `User ${userId} is starting lesson day ${lessonDay} on the topic "${selectedTopic}". BRAVED themes: Bitcoin, RWAs, AI, VR/AR, Emotional Intelligence, Decentralization. Create a concise, 5-minute learning module. The output MUST be a JSON object with fields: "topic" (string), "lessonDay" (number), "question" (string, engaging question for the user), "options" (string array, 3-4 choices), "answer" (string, one of the options). Focus on a single key concept within ${selectedTopic}.`;

        try {
            const llmResponse = await mcp.callModel({
                model: 'grok', // or another suitable model
                prompt: lessonPrompt,
            });
            const lessonData = JSON.parse(llmResponse); // Assuming LLM returns stringified JSON
            return { ...lessonData, topic: selectedTopic, lessonDay }; // Ensure topic and day are correctly set
        } catch (error) {
            console.error(`Error generating lesson for ${userId} on ${selectedTopic}: ${error.message}`);
            // Return a fallback lesson
            return { 
                topic: selectedTopic, 
                lessonDay, 
                question: "What is a key aspect of decentralization?", 
                options: ["Central control", "Distributed networks", "Single point of failure"], 
                answer: "Distributed networks", 
                streakReward: false 
            };
        }
    },

    deliverLesson: async (userId, lesson) => {
        console.log(`Delivering lesson ${lesson.topic} Day ${lesson.lessonDay} for userId: ${userId}`);
        let userData = mcp.memory.get(`user_${userId}`) || { userId, streak: 0, lessonsCompleted: {}, currentLesson: null };
        
        userData.streak = (userData.currentLesson && userData.currentLesson.topic === lesson.topic && userData.currentLesson.lessonDay === lesson.lessonDay) ? userData.streak : userData.streak + 1;
        userData.currentLesson = lesson;
        userData.lessonsCompleted[lesson.topic] = Math.max(userData.lessonsCompleted[lesson.topic] || 0, lesson.lessonDay);

        mcp.memory.set(`user_${userId}`, userData);
        return userData.streak;
    },

    updateUserData: async (userId, dataToUpdate) => {
        let userData = mcp.memory.get(`user_${userId}`) || { userId, streak: 0, lessonsCompleted: {}, currentLesson: null };
        userData = { ...userData, ...dataToUpdate };
        mcp.memory.set(`user_${userId}`, userData);
        console.log(`Updated user data for userId: ${userId}`);
        return userData;
    },

    postSocialMessage: async (postData) => {
        console.log(`SIMULATED [${postData.platform}] POST by ${postData.userId || 'System'}: ${postData.message}`);
        return { status: 'success', message: 'Posted successfully (simulated)' };
    },

    checkStreakMilestone: async (userId, currentStreak) => {
        if (currentStreak > 0 && currentStreak % 3 === 0) {
            return { isMilestone: true, message: `Bee-lliant! You've hit a ${currentStreak}-day streak! Keep buzzing!` };
        }
        return { isMilestone: false };
    }
};

module.exports = tools; 