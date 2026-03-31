from app.services.rule_engine import assign_category

class DummyTxn:
    merchant = "SWIGGY FOOD"
    description = "Food order"

from app.services.rule_engine import assign_category

def test_rule_priority():
    rules = [
        {"rule_type": "keyword", "rule_value": "food", "category": "Food"},
        {"rule_type": "merchant_exact", "rule_value": "swiggy", "category": "Dining"},
    ]

    class FakeTxn:
        merchant = "swiggy"
        description = "food order"

    category = assign_category(FakeTxn(), rules)

    assert category == "Dining"

def test_case_insensitive():
    rules = [
        {"rule_type": "merchant_exact", "rule_value": "swiggy", "category": "Food"},
    ]

    txn = DummyTxn()
    category = assign_category(txn, rules)

    assert category == "Food"