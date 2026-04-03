from pydantic import BaseModel,EmailStr

class LoginUser(BaseModel):
    email:EmailStr
    password:str

class Token(BaseModel):
      access_token:str
      token_type:str

class Refresh_Token(BaseModel):
      refresh_token:str
      token_type:str

class Config:
        from_attributes = True