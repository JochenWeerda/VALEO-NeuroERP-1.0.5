from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
import uvicorn

app = FastAPI(title="VALEO NeuroERP API")

# CORS konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Konfiguration
SECRET_KEY = "valeo-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Pydantic Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    user: dict

class User(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str

# Test-Benutzer
test_user = {
    "id": "1",
    "username": "admin",
    "password": "admin123",
    "email": "admin@valeo.com",
    "full_name": "VALEO Administrator",
    "role": "admin"
}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token abgelaufen")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Ungültiger Token")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "VALEO NeuroERP API läuft"}

@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    if request.username == test_user["username"] and request.password == test_user["password"]:
        access_token = create_access_token(
            data={"sub": test_user["username"], "user_id": test_user["id"]}
        )
        refresh_token = create_access_token(
            data={"sub": test_user["username"], "type": "refresh"}
        )
        
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
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
    else:
        raise HTTPException(status_code=401, detail="Ungültige Anmeldedaten")

@app.get("/auth/me", response_model=User)
async def get_current_user(token: dict = Depends(verify_token)):
    return User(
        id=test_user["id"],
        username=test_user["username"],
        email=test_user["email"],
        full_name=test_user["full_name"],
        role=test_user["role"]
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 