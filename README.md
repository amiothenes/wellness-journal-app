# Wellness Journal App

A full-stack wellness journaling application that combines personal journaling with AI-powered responses and sentiment analysis to support mental health and self-reflection.

## Features

- **Daily Journaling**: Write entries with mood tracking (1-10 scale)
- **AI Assistant**: Get personalized responses based on your journal entries
- **Sentiment Analysis**: ML-powered mood analysis and insights
- **Mood Visualization**: Calendar view of your emotional patterns
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express and SQLite
- **ML Service**: Python with scikit-learn for sentiment analysis
- **Styling**: CSS with custom design system

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start development servers**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - ML Service: http://localhost:8000

## Project Structure

```
├── frontend/          # React TypeScript app
├── backend/           # Express.js API server
├── ml-service/        # Python sentiment analysis service
└── docs/             # Project documentation
```

## Development

The app runs three services concurrently:
- **Frontend**: React development server
- **Backend**: Express API with SQLite database
- **ML Service**: Python Flask app for sentiment analysis

All services start automatically with `npm run dev`.

## License

ISC