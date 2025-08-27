import { ChatParagraph } from "../types/Entry";

export interface SentimentAnalysis {
  score: number; // -1 to 1, where -1 is very negative
  threshold_met: boolean;
  suggested_response_type: 'acknowledgment' | 'coping_strategy' | 'therapy_suggestion';
}

// Fake sentiment analysis for now
export const analyzeSentiment = (text: string, mood: number): SentimentAnalysis => {
  // Simple threshold logic for testing
  const lowMoodThreshold = mood <= 3;
  const negativeKeywords = ['sad', 'depressed', 'hopeless', 'awful', 'terrible', 'hate', 'worthless'];
  const hasNegativeKeywords = negativeKeywords.some(word => 
    text.toLowerCase().includes(word)
  );
  
  const score = lowMoodThreshold && hasNegativeKeywords ? -0.8 : 
                lowMoodThreshold ? -0.5 : 
                hasNegativeKeywords ? -0.6 : 0.2;
  
  return {
    score,
    threshold_met: score <= -0.5,
    suggested_response_type: score <= -0.7 ? 'therapy_suggestion' : 
                           score <= -0.5 ? 'coping_strategy' : 'acknowledgment'
  };
};

export const generateAIResponse = async (
  // analysis: SentimentAnalysis, 
  userText: string,
  mood: number
): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3001/api/journal/ai-response/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: userText,
        mood: mood,
        emotionType: 'default', //TODO change hard code based on ML
        sentimentScore: 0 //TODO this too
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Failed to generate AI response:', error);
    // Return fallback response
    return "I'm here to listen and support you through this. Your feelings are valid, and it's okay to take things one step at a time.";
  }
};

// Cooldown logic - only respond once per hour to avoid spam
export const shouldGenerateResponse = (paragraphs: ChatParagraph[]): boolean => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentAIResponses = paragraphs.filter(p => 
    p.paragraph_type === 'ai_response' && 
    new Date(p.timestamp) > oneHourAgo
  );
  
  return recentAIResponses.length === 0;
};