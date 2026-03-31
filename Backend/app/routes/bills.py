from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.bill_schema import BillCreate, BillResponse,BillUpdate

from app.services.bill_service import (
    create_bill,
    get_bills_for_user,
    mark_bill_paid,
    delete_bill,
    update_bill   
)

router = APIRouter(prefix="/bills", tags=["Bills"])


# CREATE BILL
@router.post("/", response_model=BillResponse)
def create_bill_route(bill: BillCreate, db: Session = Depends(get_db)):

    new_bill = create_bill(db, bill)
    return new_bill



@router.get("/user/{user_id}", response_model=List[BillResponse])
def get_bills(user_id: int, db: Session = Depends(get_db)):

    bills = get_bills_for_user(db, user_id)
    return bills



@router.put("/pay/{bill_id}")
def mark_bill_paid_route(bill_id: int, db: Session = Depends(get_db)):

    bill = mark_bill_paid(db, bill_id)

    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {"message": "Bill marked as paid"}



@router.delete("/{bill_id}")
def delete_bill_route(bill_id: int, db: Session = Depends(get_db)):

    result = delete_bill(db, bill_id)

    if not result:
        raise HTTPException(status_code=404, detail="Bill not found")

    return {"message": "Bill deleted successfully"}


@router.put("/{bill_id}", response_model=BillResponse)
def update_bill_route(
    bill_id: int,
    bill: BillUpdate,
    db: Session = Depends(get_db)
):

    updated_bill = update_bill(db, bill_id, bill)

    if not updated_bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    return updated_bill