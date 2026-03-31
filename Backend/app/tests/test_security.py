from fastapi import HTTPException
from app.services.transaction_service import recategorize_transaction_service
from app.schemas.transaction import RecategorizeRequest


def test_permission_block(db):

    # fake user (wrong owner)
    fake_user = type("obj", (object,), {"id": 999})

    payload = RecategorizeRequest(
        category="Food",
        create_rule=False
    )

    try:
        recategorize_transaction_service(
            1,
            payload,
            fake_user,
            db
        )
    except HTTPException as e:
        assert e.status_code == 403