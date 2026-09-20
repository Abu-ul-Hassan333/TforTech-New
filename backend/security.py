from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import (
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)


# =========================================================
# PASSWORD HASHING
# =========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Convert a plain-text password into a secure bcrypt hash.
    """
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain-text password against its stored bcrypt hash.

    Returns:
        True  -> password matches
        False -> password does not match
    """
    try:
        return pwd_context.verify(
            plain_password,
            hashed_password,
        )
    except Exception:
        return False


# =========================================================
# JWT ACCESS TOKEN
# =========================================================

def create_access_token(data: dict) -> str:
    """
    Create a JWT access token.

    The supplied data is copied so the original dictionary
    is not modified.
    """

    token_data = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    token_data.update(
        {
            "exp": expire,
        }
    )

    return jwt.encode(
        token_data,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(token: str):
    """
    Decode and validate a JWT access token.

    Returns:
        JWT payload dictionary if the token is valid.

        None if:
        - token is invalid
        - token is expired
        - token signature is invalid
        - JWT decoding fails
    """

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )

        return payload

    except JWTError:
        return None
    except Exception:
        return None