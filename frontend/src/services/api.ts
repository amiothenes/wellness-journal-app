const API_BASE = 'http://localhost:3001/api';

export const journalAPI = {
  // Get all entries for sidebar
  getAllEntries: async () => {
    const response = await fetch(`${API_BASE}/journal/entries`);
    return response.json();
  },
  
  // Get paragraphs for selected entry
  getEntryParagraphs: async (entryId: number) => {
    const response = await fetch(`${API_BASE}/journal/entries/${entryId}/paragraphs`);
    return response.json();
  },
  
  // Create new entry with first paragraph
  createEntry: async () => {
    const response = await fetch(`${API_BASE}/journal/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },
  
  // Add paragraph to existing entry
  addParagraph: async (entryId: number, mood: number, text: string) => {
    const response = await fetch(`${API_BASE}/journal/entries/${entryId}/paragraphs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, text })
    });
    return response.json();
  },

  deleteEntry: async (entryId: number) => {
    const response = await fetch(`${API_BASE}/journal/entries/${entryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  deleteParagraph: async (paragraphId: number) => {
    const response = await fetch(`${API_BASE}/journal/paragraphs/${paragraphId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  getTodaysEntry: async () => {
    const response = await fetch(`${API_BASE}/journal/entries/today`);
    if (response.status === 404) {
      return null; // No entry for today
    }
    return response.json();
  },

  createAIResponse: async (entryId: number, text: string, triggerParagraphId: number, aiResponseData: any) => {
    const response = await fetch(`${API_BASE}/journal/ai-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, text, triggerParagraphId, aiResponseData })
    });
    return response.json();
  }
};