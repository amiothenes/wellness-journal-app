export interface Suggestion {
    id?: number;
    suggestion_text: string;
    mood_level: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateSuggestionRequest {
    text: string;
    mood: number;
    emotion_tag: string;
    suggestion_type_tag: string;
    related_journal_entries: string;
}