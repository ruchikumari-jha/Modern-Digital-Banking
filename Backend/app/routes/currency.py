from fastapi import APIRouter
from app.services.currency_service import get_currency_rates

router = APIRouter(prefix="/currency", tags=["Currency"])


@router.get("/rates")
def currency_rates():

    rates = get_currency_rates()

    return rates