from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alert import Alert
from app.services.alert_service import check_low_balance, check_bill_due

router = APIRouter(prefix="/alerts", tags=["Alerts"])


# GENERATE ALERTS (kept from step-2)
@router.post("/generate")
def generate_alerts(user_id: int, db: Session = Depends(get_db)):
    low = check_low_balance(db, user_id)
    bill = check_bill_due(db, user_id)

    return {
        "low_balance_created": len(low),
        "bill_due_created": len(bill)
    }


#  GET ALL ALERTS (PRO VERSION)
@router.get("/")
def get_alerts(
    user_id: int,
    skip: int = Query(0, ge=0),         #pagination
    limit: int = Query(10, le=100),     #pagination
    db: Session = Depends(get_db)
):
    alerts = (
        db.query(Alert)
        .filter(Alert.user_id == user_id)
        .order_by(Alert.created_at.desc())   #  latest sorting
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": a.id,
            "type": a.type,
            "message": a.message,
            "is_read": a.is_read,
            "created_at": str(a.created_at)
        }
        for a in alerts
    ]


# GET UNREAD ALERTS
@router.get("/unread")
def get_unread_alerts(
    user_id: int,
    db: Session = Depends(get_db)
):
    alerts = (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.is_read == False
        )
        .order_by(Alert.created_at.desc())
        .all()
    )

    return [
        {
            "id": a.id,
            "type": a.type,
            "message": a.message,
            "created_at": str(a.created_at)
        }
        for a in alerts
    ]


#  MARK AS READ (PRO VERSION)
@router.post("/mark-read")
def mark_read(alert_id: int, db: Session = Depends(get_db)):

    alert = db.query(Alert).filter(Alert.id == alert_id).first()

    if not alert:
        return {"message": "Alert not found"}

    if alert.is_read:
        return {"message": "Already marked as read"}

    alert.is_read = True
    db.commit()

    return {"message": "Alert marked as read"}

@router.get("/count")
def get_alert_count(user_id: int, db: Session = Depends(get_db)):
    count = db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.is_read == False
    ).count()

    return {"unread_count": count}        #alert count for user_id

@router.post("/mark-all-read")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    db.query(Alert).filter(
        Alert.user_id == user_id,
        Alert.is_read == False
    ).update({"is_read": True})

    db.commit()

    return {"message": "All alerts marked as read"}      #clear all alerts 