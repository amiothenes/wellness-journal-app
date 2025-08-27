import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const generateTherapyResponse = async (
  userText: string,
  mood: number,
  emotionType: string,
  sentimentScore: number
): Promise<string> => {
  try {
    const response = await hf.chatCompletion({
      provider: 'hf-inference',
      model: "HuggingFaceTB/SmolLM3-3B",
      messages: [
        {
          role: "system",
          content: "You are a compassionate mental health assistant. Provide brief, supportive responses with practical coping strategies. Keep responses under 150 words, be empathetic, and focus on helpful advice. Do not include any thinking or reasoning - provide only the direct supportive response. Use plain text without any bold formatting or asterisks."
        },
        {
          role: "user",
          content: `I'm feeling ${emotionType} emotions with a mood rating of ${mood}/10. Here's what I shared: "${userText}". Can you provide some supportive advice and coping strategies?`
        }
      ],
      max_tokens: 500,
      temperature: 0.6
    });
    console.log(response.choices[0].message);
    // Extract the response content
    let generatedText = "";
    if (response.choices && response.choices.length > 0 && response.choices[0].message) {
      generatedText = response.choices[0].message.content || "";
    }
    
    // Clean up the response - remove thinking sections
    generatedText = generatedText.trim();
    
    // Remove <think> tags and everything inside them
    generatedText = generatedText.replace(/<think>[\s\S]*?<\/think>/gi, '');
    generatedText = generatedText.replace(/<think>[\s\S]*/gi, ''); // In case it's not closed
    
    // Remove any thinking/reasoning prefixes that might appear
    const thinkingPrefixes = [
      'thinking:',
      'thought:',
      'analysis:',
      'reasoning:',
      'let me think:',
      'response:',
      'okay,',
      'first,',
      'let me break this down'
    ];
    
    for (const prefix of thinkingPrefixes) {
      if (generatedText.toLowerCase().startsWith(prefix)) {
        generatedText = generatedText.substring(prefix.length).trim();
      }
    }

    // Clean up any remaining artifacts
    generatedText = generatedText.replace(/^[.\s,]+/, ''); // Remove leading punctuation/spaces
    
    // If the response is still too short or empty after cleaning, use fallback
    if (generatedText.length < 20) {
      console.log('Response too short after cleaning, using fallback');
      return generateFallbackResponse(emotionType);
    }

    return generatedText || generateFallbackResponse(emotionType);
  } catch (error) {
    console.error('LLM API error:', error);
    return generateFallbackResponse(emotionType);
  }
};

const generateFallbackResponse = (emotionType: string): string => {
  const responses = {
    anxiety: "I understand you're feeling anxious. Try taking slow, deep breaths - inhale for 4 counts, hold for 4, exhale for 4. Consider grounding techniques like naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    depression: "Your feelings are valid, and you're not alone in this. Consider reaching out to a friend, family member, or mental health professional. Small steps like going outside for fresh air or doing one small task can help build momentum.",
    anger: "It's completely normal to feel angry sometimes. Try some physical activity like walking or stretching to help process these emotions. Writing down your thoughts can also help you understand what's triggering these feelings.",
    coping_strategy: "Thank you for sharing your thoughts. Remember that it's okay to have difficult emotions. Consider practicing self-care activities that bring you comfort, and don't hesitate to reach out for support when you need it.",
    acknowledgment: "I hear you, and your feelings are completely valid. It takes courage to express your emotions. Remember that you have the strength to work through this, one step at a time.",
    therapy_suggestion: "These feelings seem quite intense, and it might be helpful to speak with a mental health professional who can provide personalized support. Consider calling a mental health helpline if you need someone to talk to right now - the 988 Suicide & Crisis Lifeline is available 24/7.",
    default: "Thank you for sharing your feelings with me. Your emotions are valid, and it's brave to express them. Consider speaking with someone you trust, and remember that it's okay to ask for help when you need it."
  };
  
  return responses[emotionType as keyof typeof responses] || responses.default;
};