import requests

EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/INR"

def get_currency_rates():

    try:
        response = requests.get(EXCHANGE_API_URL, timeout=5)
        data = response.json()

        rates = data.get("rates", {})

        return {
            "USD": rates.get("USD"),
            "EUR": rates.get("EUR"),
            "GBP": rates.get("GBP")
        }

    except Exception:
        return {
            "error": "Unable to fetch currency rates"
        }