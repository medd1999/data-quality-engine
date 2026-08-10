from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Alert(BaseModel):
    severity: str
    code: str
    message: str
    column: Optional[str] = None
    row: Optional[int] = None
    timestamp: datetime
    
class AlertPayload(BaseModel):
    run_id: int
    dataset_id: int
    alerts: List[Alert]