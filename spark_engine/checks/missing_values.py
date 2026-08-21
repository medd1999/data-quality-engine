import pandas as pd
import numpy as np

def check_missing_values(df: pd.DataFrame):
    return df.isna().sum().to_dict()