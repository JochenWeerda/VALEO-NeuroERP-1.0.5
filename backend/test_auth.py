from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
import uuid

app = FastAPI(title="VALEO NeuroERP - Test Auth")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Config
SECRET_KEY = "valeo-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Test User
test_user = {
    "id": str(uuid.uuid4()),
    "username": "admin",
    "email": "admin@valeoflow.de",
    "full_name": "VALEO Administrator",
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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "VALEO NeuroERP Auth API läuft"}

@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.username == "admin" and request.password == "admin123":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": test_user["username"]}, expires_delta=access_token_expires
        )
        
        return LoginResponse(
            access_token=access_token,
            refresh_token="test-refresh-token",
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=test_user
        )
    else:
        raise HTTPException(
            status_code=401,
            detail="Ungültige Anmeldedaten"
        )

@app.get("/auth/me")
async def get_current_user():
    return test_user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 