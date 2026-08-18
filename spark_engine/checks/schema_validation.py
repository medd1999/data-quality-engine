import pandas as pd


def check_schema(df: pd.DataFrame, expected_schema: dict):
    results = {
        "missing_values": [],
        "unexpected_values": [],
        "type_mismatches": [],
        "nullability_violations": []
    }
    
    actual_columns = df.columns.tolist()
    
    for col, rules in expected_schema.items():
        if col not in actual_columns:
            results["missing_values"].append(col)
            
    for col in actual_columns:
        if col not in expected_schema:
            results["unexpected_values"].append(col)
            
    for col, rules in expected_schema.items():
        if col not in df.columns:
            continue
        
        actual_type = str(df[col].dtype)
        expected_type = rules["type"]
        
        if expected_type == "int" and not pd.api.types.is_integer_dtype(df[col]):
            results["type_mismatches"].append({"column": col, "expected": "int", "actual": actual_type})
            
        if expected_type == "string" and not pd.api.types.is_string_dtype(df[col]):
            results["type_mismatches"].append({"column": col, "expected": "string", "actual": actual_type})
            
        if expected_type == "datetime" and not pd.api.types.is_datetime64_dtype(df[col]):
            results["type_mismatches"].append({"column": col, "expected": "datetime", "actual": actual_type})
            
        if rules.get("required") and df[col].isna().any():
            results["nullability_violations"].append(col)
            
    return results