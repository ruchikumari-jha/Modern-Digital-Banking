from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.account import AccountCreate, AccountOut
from app.models.account import Account
from app.database import get_db
from app.services.account_service import new_account,get_account,get_account_id
from app.utils.jwt_handler import verify_token

router = APIRouter()



@router.get("/getaccount", response_model=list[AccountOut])
def get_accounts(db: Session = Depends(get_db)):
  
    return get_account(db)



@router.post("/accounts", response_model=AccountOut)
def create_account(account: AccountCreate,user_id:int = Depends(verify_token), db: Session = Depends(get_db)):

    return new_account(db,account,user_id)

@router.get("/{id}")
def get_abbountby_id(id:int,db:Session = Depends(get_db),):
    return get_account_id(db,id)


