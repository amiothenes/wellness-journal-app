# preprocessing.py - Standalone preprocessing module
import re
import nltk
import pandas as pd
from nltk.corpus import stopwords

# Download necessary NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    print("Warning: Failed to download NLTK data")

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
