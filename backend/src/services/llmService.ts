import { HfInference } from '@huggingface/inference';
import * as dotenv from 'dotenv';

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const generateTherapyResponse = async (
  userText: string,
): Promise<string> => {
  try {
    const response = await hf.chatCompletion({
      provider: 'hf-inference',
      model: "HuggingFaceTB/SmolLM3-3B",
      messages: [
        {
          role: "system",
          content: "You are a compassionate mental health assistant. Provide brief, supportive responses with practical coping strategies. Keep responses under 150 words, be empathetic, and focus on helpful advice. Do not include any thinking or reasoning - provide only the direct supportive response. Use plain text without any emojis, bold formatting or asterisks."
        },
        {
          role: "user",
          content: `I'm feeling negative emotions. Here's what I shared: "${userText}". Can you provide some supportive advice and coping strategies?`
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
      return generateFallbackResponse();
    }

    return generatedText || generateFallbackResponse();
  } catch (error) {
    console.error('LLM API error:', error);
    return generateFallbackResponse();
  }
};

const generateFallbackResponse = (): string => {
  const responses = {
    default: "Thank you for sharing your feelings with me. Your emotions are valid, and it's brave to express them. Consider speaking with someone you trust, and remember that it's okay to ask for help when you need it."
  };
  
  return responses.default;
};