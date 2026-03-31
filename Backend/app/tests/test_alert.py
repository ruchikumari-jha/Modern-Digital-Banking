from app.services.alert_service import check_and_create_budget_alert

def test_alert_created_once(db):

    first = check_and_create_budget_alert(db, 1, "Food")
    second = check_and_create_budget_alert(db, 1, "Food")

    assert second is False

from app.services.alert_service import check_and_create_budget_alert

def test_alert_creation(db):

    created = check_and_create_budget_alert(db, 1, "Food")

    assert created is True

def test_no_duplicate_alert(db):

    check_and_create_budget_alert(db, 1, "Food")
    created_again = check_and_create_budget_alert(db, 1, "Food")

    assert created_again is False