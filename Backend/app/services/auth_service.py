from sqlalchemy.orm import Session 
from fastapi import HTTPException
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import LoginUser

from app.utils.security import hash_password,verify_password
from app.utils.jwt_handler import create_token,create_refresh_token




# -----globally declared ---------


def new_user(db:Session,user:UserCreate):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    hassed_password = hash_password(user.password)
    newUser = User(
        name = user.name,
        email = user.email,
        password = hassed_password,
        phone = user.phone,
       
    )
    db.add(newUser)
    db.commit()
    db.refresh(newUser)
    user_id = newUser.id
    token = create_token({
        "user_id":user_id
    })

    refresh_token = create_refresh_token({
        "user_id":user_id
    })
    return token,refresh_token
def login(db: Session, loginuser: LoginUser):

    user = db.query(User).filter(User.email == loginuser.email).first()

    if user is None:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, loginuser.password):
        raise HTTPException(status_code=400, detail="Wrong password")

    token = create_token({
        "user_id": user.id
    })

    refresh_token = create_refresh_token({
        "user_id": user.id
    })

    return token, refresh_token

        
        



