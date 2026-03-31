from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import new_user,login
from app.schemas.user import UserCreate,UserOut
from app.schemas.auth import LoginUser
from app.schemas.account import AccountOut,AccountIdOut
from app.models.account import Account
from app.models.user import User
from app.utils.jwt_handler import refreh,verify_token
from app.schemas.user import UserAccountOut


router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/signup")
def signup(user:UserCreate ,db: Session = Depends(get_db)):

    access,ref = new_user(db,user)
    return {
    "access_token": access,
    "token_type": "bearer",
    "refresh_token": ref,
    
    }


@router.post("/login")
def login_user(user:LoginUser, db: Session = Depends(get_db)):

    ref,access = login(db,user)
    return {
    "access_token": access,
    "token_type": "bearer",
    "refresh_token": ref,
    
    
}
  



@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


@router.post("/refresh")
def refresh(refreshtoken:str):
    return refreh(refreshtoken)

@router.post("/profile")
def verify(user_id:int = Depends(verify_token)):
    return{"user_id":user_id}

@router.get("/getaccount_id",response_model=AccountIdOut)
def getaccount_id(db:Session = Depends(get_db),user_id:int = Depends(verify_token)):
    result = db.query(Account).filter(Account.user_id == user_id).first()
    if not result:
        raise HTTPException(status_code=404,detail="Account not found")
    return result
@router.get("/getuser",response_model=UserAccountOut)
def getPerson(db:Session = Depends(get_db),user_id:int = Depends(verify_token)):
    result = db.query(User).filter(User.id == user_id).first()
    account = db.query(Account).filter(Account.user_id == user_id).first()
    return {
    "user": result,
    "account": account
}