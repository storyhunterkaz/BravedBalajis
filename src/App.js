import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getLesson, submitAnswer } from './services/api';

// Global Styles
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: #f0f0f0;
  }
  * {
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  background: #0a0a0a;
  color: #F3B315;
  font-family: 'Press Start 2P', 'Courier New', Courier, monospace;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.header`
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  h1 {
    font-size: 2.5em;
    color: #FF69B4;
  }
`;

const MrsBeenSpeaks = styled.div`
  background: rgba(255, 105, 180, 0.1);
  border: 2px solid #F3B315;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 600px;
  text-align: center;
  p {
    margin: 5px 0;
    font-size: 1.1em;
  }
  .streak {
    color: #F3B315;
    font-weight: bold;
  }
`;

const LessonPanel = styled.div`
  background: rgba(243, 179, 21, 0.1);
  border: 2px solid #FF69B4;
  padding: 20px;
  border-radius: 15px;
  width: 90%;
  max-width: 700px;
  text-align: center;

  h2 {
    color: #FF69B4;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
`;

const OptionButton = styled.button`
  background: #F3B315;
  color: #0a0a0a;
  border: none;
  padding: 12px 20px;
  font-family: inherit;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #FF69B4;
    color: #fff;
    transform: scale(1.03);
  }
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
    border: 5px solid #f3f3f3;
    border-top: 5px solid #F3B315;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 20px auto;

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

function App() {
    const [userId] = useState('balajiFan101'); // Hardcoded MVP userId
    const [currentLesson, setCurrentLesson] = useState(null);
    const [streak, setStreak] = useState(0);
    const [messageFromMrsBeen, setMessageFromMrsBeen] = useState("Welcome! Let's get learning with Mrs. Been! 🐝");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadLesson = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getLesson(userId);
            setCurrentLesson(data.lesson);
            setStreak(data.streak);
            if(data.message) setMessageFromMrsBeen(data.message);
            else if(!data.lesson) setMessageFromMrsBeen("Mrs. Been is preparing your next lesson... or maybe taking a nap! 😴");
        } catch (error) {
            console.error("Failed to fetch lesson:", error);
            setMessageFromMrsBeen("Oh dear! Mrs. Been seems to have flown into a technical difficulty. Try again shortly!");
            setCurrentLesson(null);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadLesson();
    }, [loadLesson]);

    const handleAnswerSubmit = async (answer) => {
        if (!currentLesson) return;
        setIsSubmitting(true);
        try {
            const result = await submitAnswer(userId, answer);
            setMessageFromMrsBeen(result.message);
            setStreak(result.newStreak);

            if (result.correct && result.nextLesson) {
                setCurrentLesson(result.nextLesson);
            }
        } catch (error) {
            console.error("Failed to submit answer:", error);
            setMessageFromMrsBeen("A little hiccup sending your answer! Please try again. 🐝");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <GlobalStyle />
            <AppContainer>
                <Header><h1>BravedBalajis</h1></Header>

                <MrsBeenSpeaks>
                    <p>🐝 Mrs. Been says: "{messageFromMrsBeen}"</p>
                    <p>Your Streak: <span className="streak">{streak} days!</span></p>
                </MrsBeenSpeaks>

                {isLoading ? (
                    <LoadingSpinner />
                ) : currentLesson ? (
                    <LessonPanel>
                        <h2>{currentLesson.topic} - Day {currentLesson.lessonDay}</h2>
                        <p>{currentLesson.question}</p>
                        <OptionsContainer>
                            {currentLesson.options.map((option, index) => (
                                <OptionButton
                                    key={index}
                                    onClick={() => handleAnswerSubmit(option)}
                                    disabled={isSubmitting}
                                >
                                    {option}
                                </OptionButton>
                            ))}
                        </OptionsContainer>
                    </LessonPanel>
                ) : (
                    <p>No lesson available right now. Try refreshing, or Mrs. Been might be on a break!</p>
                )}
            </AppContainer>
        </>
    );
}

export default App; 