from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import uuid

app = FastAPI(title="VALEO NeuroERP - Simple Auth")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5176"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Config
SECRET_KEY = "valeo-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Test User (In-Memory)
test_user = {
    "id": str(uuid.uuid4()),
    "username": "admin",
    "email": "admin@valeoflow.de",
    "full_name": "VALEO Administrator",
    "hashed_password": pwd_context.hash("admin123"),
    "role": "admin",
    "disabled": False
}

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Einfacher Login-Endpunkt"""
    
    if login_data.username != test_user["username"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not verify_password(login_data.password, test_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Token erstellen
    access_token = create_access_token(
        data={"sub": test_user["username"], "user_id": test_user["id"], "role": test_user["role"]}
    )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token="dummy-refresh-token",
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": test_user["id"],
            "username": test_user["username"],
            "email": test_user["email"],
            "full_name": test_user["full_name"],
            "role": test_user["role"]
        }
    )

@app.get("/")
async def root():
    return {"message": "VALEO NeuroERP API läuft"}

@app.get("/health")
async def health():
    return {"status": "healthy"} 