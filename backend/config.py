import os

from dotenv import load_dotenv


# Load variables from .env
load_dotenv()


# Application settings
APP_NAME = os.getenv(
    "APP_NAME",
    "GoJuniors Laptop Store",
)

APP_ENV = os.getenv(
    "APP_ENV",
    "development",
)

PORT = int(
    os.getenv(
        "PORT",
        "8000",
    )
)


# MongoDB settings
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb://127.0.0.1:27017",
)

MONGO_DB_NAME = os.getenv(
    "MONGO_DB_NAME",
    "gojuniors",
)


# JWT settings
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "change-this-secret-key-later",
)

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256",
)

JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
        "1440",
    )
)


# Frontend settings
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)