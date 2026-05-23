from fastapi import APIRouter, HTTPException
import db_manager
import auth
from schemas import UserRegisterPayload, UserLoginPayload, AuthResponse
from utils import seed_sample_data

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

@router.post("/register", response_model=AuthResponse)
def register_user(payload: UserRegisterPayload):
    existing = db_manager.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    
    # Hash password and store user
    pwd_hash = auth.get_password_hash(payload.password)
    user_id = db_manager.create_user(payload.email, pwd_hash)
    
    # Automatically seed sample database for instant experience
    seed_sample_data(user_id)
    
    # Generate token
    token = auth.create_access_token({"sub": user_id})
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        email=payload.email,
        user_id=user_id
    )

@router.post("/login", response_model=AuthResponse)
def login_user(payload: UserLoginPayload):
    user = db_manager.get_user_by_email(payload.email)
    if not user or not auth.verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")
    
    token = auth.create_access_token({"sub": user["id"]})
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        email=user["email"],
        user_id=user["id"]
    )
