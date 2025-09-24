# app/models/sentiment.py
import joblib
import numpy as np
from pathlib import Path
import logging
import nltk
import re
import pandas as pd
from nltk.corpus import stopwords
import sys

logger = logging.getLogger(__name__)

# Download necessary NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    logger.warning("Failed to download NLTK data, may cause issues")

# Define preprocessing function (exactly as used in training)
stop_words = set(stopwords.words('english'))

def preprocess_text(texts):
    """Preprocessing function that matches the training pipeline"""
    # Handle sklearn FunctionTransformer input (array-like)
    if hasattr(texts, '__iter__') and not isinstance(texts, str):
        # Process array/list of texts
        processed = []
        for text in texts:
            text = re.sub(r'[^\w\s]', '', text.lower())
            tokens = text.split()
            tokens = [word for word in tokens if word not in stop_words]
            processed.append(' '.join(tokens))
        return processed
    elif isinstance(texts, str):
        # Process single string
        text = re.sub(r'[^\w\s]', '', texts.lower())
        tokens = text.split()
        tokens = [word for word in tokens if word not in stop_words]
        return ' '.join(tokens)
    elif isinstance(texts, pd.Series):
        # Process pandas Series (as originally intended)
        return texts.apply(lambda x: ' '.join([
            word for word in re.sub(r'[^\w\s]', '', x.lower()).split()
            if word not in stop_words
        ]))
    else:
        raise TypeError("Input must be a string, array-like, or pandas Series")

# Inject the function into __main__ to match the saved model
if '__main__' in sys.modules:
    sys.modules['__main__'].preprocess_text = preprocess_text

class SentimentAnalyzer:
    def __init__(self, threshold=-0.5):
        self.threshold = threshold
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the trained sentiment model"""
        try:
            model_path = Path(__file__).parent.parent.parent / "models" / "sentiment_model.joblib"
            self.model = joblib.load(model_path)
            logger.info("Sentiment model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise e
    
    def analyze(self, text: str) -> dict:
        """Analyze sentiment of text"""

        if not text or not text.strip():
            return {"score": 0.0, "threshold_met": False, "label": "neutral", "confidence": 0.5}
    
        if len(text) > 10000:  # Prevent memory issues
            text = text[:10000]

        if not self.model:
            raise ValueError("Model not loaded")
        
        try:
            # Get prediction and probabilities
            prediction = self.model.predict([text])
            probabilities = self.model.predict_proba([text])
            
            # Extract values
            label = prediction[0]  # 'positive' or 'negative'
            neg_confidence = probabilities[0][0]  # negative confidence
            pos_confidence = probabilities[0][1]  # positive confidence
            
            # Convert to score (-1 to 1 scale)
            if label == 'negative':
                score = -neg_confidence
            else:
                score = pos_confidence
            
            # Check threshold (-0.5 for triggering response)
            threshold_met = score <= self.threshold
            
            return {
                "score": float(score),
                "threshold_met": threshold_met,
                "label": label,
                "confidence": float(max(neg_confidence, pos_confidence))
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            # Return neutral fallback
            return {
                "score": 0.0,
                "threshold_met": False,
                "label": "neutral",
                "confidence": 0.5
            }

# Singleton Service Pattern
class SentimentService:
    """Singleton service for sentiment analysis with additional utilities"""
    _instance = None
    
    def __new__(cls):
        """Ensure only one instance exists (Singleton pattern)"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize only once"""
        if not self._initialized:
            self.analyzer = None
            self.model_loaded = False
            self.model_load_time = None
            self.prediction_count = 0
            self._initialize_analyzer()
            self._initialized = True
    
    def _initialize_analyzer(self):
        """Initialize the sentiment analyzer"""
        try:
            import time
            start_time = time.time()
            
            self.analyzer = SentimentAnalyzer()
            
            load_time = time.time() - start_time
            self.model_load_time = load_time
            self.model_loaded = True
            
            logger.info(f"Sentiment model loaded successfully in {load_time:.2f}s")
        except Exception as e:
            logger.error(f"Failed to initialize sentiment analyzer: {e}")
            self.model_loaded = False
            raise e
    
    def analyze_sentiment(self, text: str) -> dict:
        """Analyze sentiment using the singleton analyzer"""
        if not self.model_loaded or not self.analyzer:
            raise RuntimeError("Sentiment model not loaded")
        
        try:
            self.prediction_count += 1
            result = self.analyzer.analyze(text)
            
            # Add metadata
            result["prediction_id"] = self.prediction_count
            result["service_status"] = "healthy"
            
            return result
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            raise e
    
    def health_check(self) -> dict:
        """Check the health status of the sentiment service"""
        health_info = {
            "service_name": "sentiment-analysis",
            "status": "healthy" if self.model_loaded else "unhealthy",
            "model_loaded": self.model_loaded,
            "predictions_served": self.prediction_count,
            "uptime_info": {
                "model_load_time_seconds": self.model_load_time,
                "ready_for_predictions": self.model_loaded
            }
        }
        
        if self.analyzer:
            health_info["model_info"] = self.get_model_info()
        
        return health_info
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model"""
        if not self.analyzer or not self.analyzer.model:
            return {"error": "Model not loaded"}
        
        model_info = {
            "model_type": type(self.analyzer.model).__name__,
            "threshold": self.analyzer.threshold,
            "preprocessing_enabled": True,
            "supported_languages": ["english"],
            "input_format": "text string",
            "output_format": {
                "score": "float (-1 to 1)",
                "threshold_met": "boolean",
                "label": "string (positive/negative)",
                "confidence": "float (0 to 1)"
            }
        }
        
        # Try to get more model details if it's a sklearn model
        try:
            if hasattr(self.analyzer.model, 'steps'):
                # It's a Pipeline
                model_info["pipeline_steps"] = [
                    {"step": step[0], "type": type(step[1]).__name__} 
                    for step in self.analyzer.model.steps
                ]
            
            if hasattr(self.analyzer.model, 'classes_'):
                model_info["classes"] = list(self.analyzer.model.classes_)
                
        except Exception as e:
            model_info["model_details_error"] = str(e)
        
        return model_info
    
    def get_statistics(self) -> dict:
        """Get service usage statistics"""
        return {
            "total_predictions": self.prediction_count,
            "model_loaded": self.model_loaded,
            "load_time_seconds": self.model_load_time,
            "average_processing_time": "Not tracked yet",  # Could implement this
            "error_rate": "Not tracked yet"  # Could implement this
        }
    
    @classmethod
    def get_instance(cls):
        """Alternative way to get the singleton instance"""
        return cls()

# Backward compatibility function
def get_sentiment_analyzer():
    """Get the singleton sentiment service (backward compatibility)"""
    return SentimentService()