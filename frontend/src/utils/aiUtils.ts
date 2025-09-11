import { ChatParagraph } from "../types/Entry";

export interface SentimentAnalysis {
  score: number; // -1 to 1, where -1 is very negative
  threshold_met: boolean;
  label?: string; // 'positive' or 'negative'
  confidence?: number; // 0 to 1
}

export const analyzeSentiment = async (text: string, mood?: number): Promise<SentimentAnalysis> => {
  try {
    const response = await fetch('http://localhost:3002/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mood })
    });
    
    if (!response.ok) throw new Error('Sentiment analysis failed');
    
    const data = await response.json();
    return {
      score: data.score,
      threshold_met: data.threshold_met,
      label: data.label,
      confidence: data.confidence
    };
  } catch (error) {
    console.error('ML sentiment analysis failed:', error);
    // Fallback to simple logic based on mood if available
    const fallbackScore = mood ? (mood - 5) / 5 : 0; // Convert 1-10 mood to -0.8 to 1.0 scale
    return { 
      score: fallbackScore, 
      threshold_met: fallbackScore <= -0.5,
      label: fallbackScore < 0 ? 'negative' : 'positive',
      confidence: 0.5
    };
  }
};

export const generateAIResponse = async (
  userText: string
): Promise<string> => {
  try {
    const response = await fetch('http://localhost:3001/api/journal/ai-response/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: userText,
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

// Enhanced function that includes ML sentiment analysis for threshold detection
export const shouldGenerateResponse = async (
  paragraphs: ChatParagraph[], 
  text: string
): Promise<boolean> => {
  // First check cooldown logic - only respond once per hour to avoid spam
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentAIResponses = paragraphs.filter(p => 
    p.paragraph_type === 'ai_response' && 
    new Date(p.timestamp) > oneHourAgo
  );
  
  if (recentAIResponses.length > 0) {
    return false; // Still in cooldown period
  }
  
  // Then check sentiment threshold using ML service
  try {
    const sentiment = await analyzeSentiment(text);
    return sentiment.threshold_met;
  } catch (error) {
    console.error('Failed to analyze sentiment for response threshold:', error);
    // Fallback: don't generate response if ML service fails
    return false;
  }
};