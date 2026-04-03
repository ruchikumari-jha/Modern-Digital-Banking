from pydantic import BaseModel


class FinancialSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float


class CategorySpending(BaseModel):
    category: str
    total_spent: float

class CategorySpendingResponse(BaseModel):
    category: str
    total_spent: float