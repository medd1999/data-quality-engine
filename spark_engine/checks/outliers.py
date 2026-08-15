import pandas as pd
import numpy as np

def check_outliers(df: pd.DataFrame, z_threshold: float = 3.0):
    results = {}
    
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    
    for col in numeric_cols:
        series = df[col].dropna()
        
        if series.empty:
            results[col] = 0
            continue
        
        mean = series.mean()
        std = series.std()
        
        if std == 0:
            results[col] = 0
            continue
        
        z_scores = (series - mean) / std
        outliers = (abs(z_scores) > z_threshold).sum()
        
        results[col] = int(outliers)
    
    return results