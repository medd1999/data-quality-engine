import pandas as pd
import numpy as np

def check_duplicate_rows(df: pd.DataFrame) -> int:
    return int(df.duplicated().sum())