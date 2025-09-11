# app/api/endpoints.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.sentiment import SentimentService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class SentimentRequest(BaseModel):
    text: str
    mood: int = None  # Optional, for future use

class SentimentResponse(BaseModel):
    score: float
    threshold_met: bool
    label: str = None
    confidence: float = None
    prediction_id: int = None
    service_status: str = None

@router.post("/analyze", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """Analyze sentiment of provided text using ML model"""
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Use the singleton service
        sentiment_service = SentimentService()
        result = sentiment_service.analyze_sentiment(request.text)
        
        return SentimentResponse(
            score=result["score"],
            threshold_met=result["threshold_met"],
            label=result["label"],
            confidence=result["confidence"],
            prediction_id=result.get("prediction_id"),
            service_status=result.get("service_status")
        )
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(status_code=500, detail="Sentiment analysis failed")

@router.get("/health")
async def health_check():
    """Comprehensive health check of the sentiment analysis service"""
    try:
        sentiment_service = SentimentService()
        health_info = sentiment_service.health_check()
        return health_info
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "service_name": "sentiment-analysis",
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/model-info")
async def get_model_info():
    """Get detailed information about the loaded ML model"""
    try:
        sentiment_service = SentimentService()
        model_info = sentiment_service.get_model_info()
        return model_info
    except Exception as e:
        logger.error(f"Model info retrieval failed: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve model information")

@router.get("/statistics")
async def get_service_statistics():
    """Get usage statistics for the sentiment analysis service"""
    try:
        sentiment_service = SentimentService()
        stats = sentiment_service.get_statistics()
        return stats
    except Exception as e:
        logger.error(f"Statistics retrieval failed: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve service statistics")