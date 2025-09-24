# Sentiment Model Training

This directory contains the machine learning pipeline for training the binary sentiment classification model used in the wellness journal application.

## Files

- `sentiment_model_training.ipynb` - Complete training pipeline from data loading to model export
- `requirements.txt` - Python dependencies for training environment

## Model Details

- **Dataset**: GoEmotions (Google Research)
- **Task**: Binary sentiment classification (positive/negative)
- **Architecture**: TF-IDF + Logistic Regression
- **Model Performance**:
![Model Performance](https://i.imgur.com/DwPJpfN.png)
- **Output**: `sentiment_model.joblib` (deployed in `../ml-service/models/`)

## Training Environment

The model was trained in Google Colab with GPU acceleration. To reproduce:

1. Open the notebook in Colab
2. Install dependencies from requirements.txt
3. Run all cells to train and export the model

## Integration

The trained model is automatically loaded by the [`SentimentService`](../ml-service/app/models/sentiment.py) in the ML service for real-time sentiment analysis.