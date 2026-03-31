
from argon2 import PasswordHasher


haser = PasswordHasher()

def hash_password(password: str):
    return haser.hash(password)

def verify_password(password: str, hashed: str):
    return haser.verify(password, hashed)

def hash_pin(password:str):
    return haser.hash(password)

def veryfy_pin(password:str,hashed:str):
    return haser.verify(password,hashed)