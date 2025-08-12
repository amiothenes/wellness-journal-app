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

// Fake AI response generator
export const generateAIResponse = (analysis: SentimentAnalysis, userText: string): string => {
  const responses = {
    acknowledgment: [
      "I hear that you're going through a difficult time. Your feelings are valid, and it's okay to feel this way.",
      "It sounds like you're dealing with some heavy emotions right now. Thank you for sharing this with me.",
      "I can sense you're struggling. Please know that you're not alone in feeling this way."
    ],
    coping_strategy: [
      "When you're feeling this way, try taking 5 deep breaths and naming 3 things you can see around you. This grounding technique can help.",
      "Consider going for a short walk outside, even if it's just for 5 minutes. Fresh air and movement can help shift your mindset.",
      "Try writing down one small thing you're grateful for today. It doesn't have to be big - even something like a warm cup of coffee counts."
    ],
    therapy_suggestion: [
      "These feelings seem quite intense. Have you considered speaking with a mental health professional? They can provide personalized support.",
      "It might be helpful to reach out to a counselor or therapist who can work with you on coping strategies tailored to your situation.",
      "Consider calling a mental health helpline if you need someone to talk to right now. The National Suicide Prevention Lifeline is 988."
    ]
  };
  
  const responseArray = responses[analysis.suggested_response_type];
  return responseArray[Math.floor(Math.random() * responseArray.length)];
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