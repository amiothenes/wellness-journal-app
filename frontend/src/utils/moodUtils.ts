import { ChatParagraph } from '../types/Entry';

export const calculateLiveMood = (paragraphs: ChatParagraph[]): number | null => {
  if (!paragraphs || paragraphs.length === 0) return null;
  const userParagraphs = paragraphs.filter(p => p.paragraph_type !== "ai_response");
  const sum = userParagraphs.reduce((acc, p) => acc + p.mood, 0);
  return Math.round((sum / userParagraphs.length) * 10) / 10;
};

export const getMoodColor = (mood: number): string => {
        const colors = [
            '#dc2626',
            '#dc2626',
            '#ea580c',
            '#f59e0b',
            '#eab308',
            '#84cc16',
            '#22c55e',
            '#16a34a',
            '#059669',
            '#047857' 
        ];
        return colors[mood - 1] || colors[4]; // Default to (5)
    };

export const getBgMoodColor = (mood: number): string => {
        const bgColors = [
            '#fee2e2',
            '#fee2e2',
            '#ffedd5',
            '#fef3c7',
            '#fef9c3',
            '#ecfccb',
            '#d1fae5',
            '#bbf7d0',
            '#a7f3d0',
            '#ccfbf1'
        ];
        return bgColors[mood - 1] || bgColors[4]; // Default to (5)
    };