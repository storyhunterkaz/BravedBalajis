export interface UserData {
    userId: string;
    streak: number;
    lessonsCompleted: { [topic: string]: number }; // e.g., { "Bitcoin": 3, "AI": 1 }
    currentLesson: Lesson | null;
    // Potential future fields: nftEligibility: boolean;
}

export interface Lesson {
    topic: string;
    lessonDay: number; // Relative to the topic
    question: string;
    options: string[];
    answer: string; // The correct option string
    streakReward?: boolean; // If completing this lesson gives a special streak indication
}

export interface PostData {
    platform: 'X' | 'Discord'; // Simulated
    message: string;
    userId?: string; // Optional, for user-specific messages
} 