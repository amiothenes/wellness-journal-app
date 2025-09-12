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
- **AI Responses**: HuggingFace API integration
- **Styling**: CSS with custom design system

## Machine Learning: Emotion-Based Binary Sentiment Classification

**Overview:**

This project features a custom-trained machine learning model for binary sentiment classification (positive/negative) specifically designed for journal wellness applications. The model leverages the GoEmotions dataset to provide accurate emotional tone analysis of user journal entries.

**Methodology:**

1. **Data Acquisition**: Used the GoEmotions dataset with 28 distinct emotion categories
2. **Emotion-to-Sentiment Mapping**: Converted granular emotions into binary sentiment labels
3. **Data Preparation**: Filtered neutral entries and split data for training/validation/testing
4. **Text Preprocessing**: Implemented cleaning pipeline (punctuation removal, lowercasing, stop word elimination)
5. **Model Development**: Built scikit-learn pipeline with TfidfVectorizer and LogisticRegression
6. **Model Evaluation**: Achieved strong performance on validation and test sets
7. **Deployment Integration**: Exported model via joblib for seamless API integration

**Key Technologies:**
- Python, pandas, scikit-learn, nltk, datasets library
- GoEmotions dataset for training data
- Custom preprocessing pipeline matching production environment

**Training Notebook**: See [`ml-training/sentiment_model_training.ipynb`](ml-training/sentiment_model_training.ipynb) for complete model development process.

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
   - Backend API: http://localhost:3001
   - ML Service: http://localhost:3002

## Project Structure

```
├── frontend/          # React TypeScript app
├── backend/           # Express.js API server  
├── ml-service/        # Python sentiment analysis service
├── ml-training/       # Machine learning model development
└── docs/             # Project documentation
```

## Development

The app runs three services concurrently:
- **Frontend**: React development server
- **Backend**: Express API with SQLite database
- **ML Service**: FastAPI app for sentiment analysis

All services start automatically with `npm run dev`.