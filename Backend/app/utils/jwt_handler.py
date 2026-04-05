import os
from datetime import datetime, timedelta
from jose import jwt,JWTError
from fastapi import Depends,HTTPException
from fastapi.security import OAuth2PasswordBearer


SECRET_KEY = os.getenv("SECRET_KEY", "90282c1f249a3ecf19403f0cd9dccc63adc089a7402bac1debf003df02121e01")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPRIE_DAYS = 7

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def create_token(data:dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp":expire})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

def create_refresh_token(data:dict):
   
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({
    "exp": expire,
    "type": "refresh"
})
    return jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)

def verify_token(token:str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401,detail="Invalid Token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401,detail="Token expired or invalid") 
    
def refreh(refresh_token:str):
    try:
        payload = jwt.decode(refresh_token,SECRET_KEY,algorithms=[ALGORITHM])

        if payload.get("type")!="refresh":
            raise HTTPException(status_code=401,detail="Inavlid token")
        user_id = payload.get("user_id")

        new_access_token = create_token({"user_id": user_id})
        
        return{"new_access":new_access_token,"type":"access"}
    except JWTError:
        raise HTTPException(status_code=401,detail="Invalid")