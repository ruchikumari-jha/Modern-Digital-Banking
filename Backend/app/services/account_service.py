from sqlalchemy.orm import Session
from fastapi import HTTPException
from sqlalchemy import select
from app.models.account import Account
from app.schemas.account import AccountCreate,AccountOut
from app.utils.security import hash_pin


def new_account(db:Session,account:AccountCreate,user_id):
   
    new_account = Account(
        user_id=user_id,
        bank_name=account.bank_name,
        account_type=account.account_type,
        account_number=account.account_number,
        currency=account.currency,
        # balance=account.balance,
        pin_hash = hash_pin(account.pin_hash)
    )
    
    db.add(new_account)
    db.commit()             
    db.refresh(new_account) 
    
    return new_account
def get_account(db:Session):
    
    result = db.query(Account).all()
    if not result:
        raise HTTPException(status_code=401,detail="user not found") 
    return result

def get_account_id(db:Session,account_id:int):

    result = db.get(Account,account_id)
    return result
  
    