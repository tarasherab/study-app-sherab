import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface TabContentProps {
    tabId: number;
    updateTabTitle: (title: string) => void;
}

interface TabData {
    topic: string;
    studentName: string;
    schoolGrade: string;
    accuracy: string;
    language: 'german' | 'english' | 'latin';
    bulletPoints: string;
    preparedText: string;
    spokenText: string;
}

interface FeedbackState {
    success: boolean | null;
    message: string;
    details?: string;
}

declare global {
    interface Window {
        webkitSpeechRecognition: any;
    }
}

const TabContent: React.FC<TabContentProps> = ({ tabId, updateTabTitle }) => {
    const [topic, setTopic] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).topic : '';
        }
        return '';
    });

    const [studentName, setStudentName] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).studentName : '';
        }
        return '';
    });

    const [schoolGrade, setSchoolGrade] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).schoolGrade : '';
        }
        return '';
    });

    const [accuracy, setAccuracy] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).accuracy : 'standard';
        }
        return 'standard';
    });

    const [language, setLanguage] = useState<'german' | 'english' | 'latin'>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).language : 'german';
        }
        return 'german';
    });

    const [bulletPoints, setBulletPoints] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).bulletPoints : '';
        }
        return '';
    });

    const [preparedText, setPreparedText] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).preparedText : '';
        }
        return '';
    });

    const [spokenText, setSpokenText] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem(`tab_${tabId}_data`);
            return savedData ? JSON.parse(savedData).spokenText : '';
        }
        return '';
    });

    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [recognition, setRecognition] = useState<any>(null);
    const [lastSaved, setLastSaved] = useState<Date>(new Date());

    useEffect(() => {
        const tabData: TabData = {
            topic,
            studentName,
            schoolGrade,
            accuracy,
            language,
            bulletPoints,
            preparedText,
            spokenText
        };
        localStorage.setItem(`tab_${tabId}_data`, JSON.stringify(tabData));
        setLastSaved(new Date());
    }, [tabId, topic, studentName, schoolGrade, accuracy, language, bulletPoints, preparedText, spokenText]);

    useEffect(() => {
        return () => {
            localStorage.removeItem(`tab_${tabId}_data`);
        };
    }, [tabId]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = language === 'german' ? 'de-DE' :
                language === 'latin' ? 'en-US' : 'en-US';

            recognition.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                setSpokenText(transcript);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };

            setRecognition(recognition);
        }
    }, [language]);

    const toggleRecording = (): void => {
        if (isRecording) {
            recognition?.stop();
        } else {
            recognition?.start();
            setSpokenText('');
        }
        setIsRecording(!isRecording);
    };

    const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newTopic = e.target.value;
        setTopic(newTopic);
        updateTabTitle(newTopic || `Topic ${tabId}`);
    };

    const analyzeResponse = async () => {
        try {
            console.log('Starting analysis...');
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    studentName,
                    schoolGrade,
                    accuracy,
                    bulletPoints,
                    preparedText,
                    spokenText,
                    language,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const analysis = await response.json();
            setFeedback({
                success: analysis.success,
                message: analysis.message,
                details: analysis.details
            });
        } catch (error) {
            console.error('Analysis error:', error);
            setFeedback({
                success: false,
                message: 'Error analyzing response',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Topic Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic:
                </label>
                <input
                    type="text"
                    value={topic}
                    onChange={handleTopicChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the topic..."
                />
            </div>

            {/* Student Name Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name:
                </label>
                <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter student name..."
                />
            </div>

            {/* School Grade Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Grade (Schulklasse):
                </label>
                <select
                    value={schoolGrade}
                    onChange={(e) => setSchoolGrade(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">Select grade...</option>
                    <option value="5">5. Klasse</option>
                    <option value="6">6. Klasse</option>
                    <option value="7">7. Klasse</option>
                    <option value="8">8. Klasse</option>
                    <option value="9">9. Klasse</option>
                    <option value="10">10. Klasse</option>
                    <option value="11">11. Klasse</option>
                    <option value="12">12. Klasse</option>
                </select>
            </div>

            {/* Analysis Accuracy Level */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Analysis Accuracy:
                </label>
                <select
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="basic">Basic (General Feedback)</option>
                    <option value="standard">Standard (Detailed Feedback)</option>
                    <option value="strict">Strict (Academic Standard)</option>
                </select>
            </div>

            {/* Language Selector */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language:
                </label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'german' | 'english' | 'latin')}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="german">Deutsch</option>
                    <option value="english">English</option>
                    <option value="latin">Latin</option>
                </select>
            </div>

            {/* Key Facts Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Facts (one per line):
                </label>
                <textarea
                    value={bulletPoints}
                    onChange={(e) => setBulletPoints(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter key facts as bullet points..."
                />
            </div>

            {/* Prepared Text Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prepared Text (optional):
                </label>
                <textarea
                    value={preparedText}
                    onChange={(e) => setPreparedText(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your prepared text..."
                />
            </div>

            {/* Speech Recognition Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Your Speech:
                    </label>
                    <button
                        onClick={toggleRecording}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-white ${isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                    >
                        {isRecording ? (
                            <><MicOff className="h-4 w-4" /> Stop Recording</>
                        ) : (
                            <><Mic className="h-4 w-4" /> Start Recording</>
                        )}
                    </button>
                </div>
                <textarea
                    value={spokenText}
                    onChange={(e) => setSpokenText(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your speech will appear here..."
                />
            </div>

            {/* Analysis Button */}
            <button
                onClick={analyzeResponse}
                disabled={!bulletPoints || !spokenText}
                className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                Analyze Response
            </button>

            {/* Feedback Display */}
            {feedback && (
                <div className={`p-4 rounded-md ${feedback.success === null
                    ? 'bg-gray-100'
                    : feedback.success
                        ? 'bg-green-100'
                        : 'bg-red-100'
                    }`}>
                    <p className="font-medium">{feedback.message}</p>
                    {feedback.details && (
                        <pre className="mt-2 whitespace-pre-line text-sm">
                            {feedback.details}
                        </pre>
                    )}
                </div>
            )}

            {/* Save Status Indicator */}
            <div className="fixed bottom-4 right-4 text-sm text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
            </div>
        </div>
    );
};

export default TabContent;