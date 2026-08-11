from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from api.app.db import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    object_key = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    runs = relationship("Run", back_populates="dataset")