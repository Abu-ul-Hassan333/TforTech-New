from typing import Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field


# =========================================================
# USER SCHEMAS
# =========================================================

class UserRegister(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    phone: str = Field(
        ...,
        min_length=7,
        max_length=20,
    )

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
    )


class UserLogin(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        min_length=6,
        max_length=100,
    )


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: str
    role: str
    is_active: bool


class AuthResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


# =========================================================
# USER PROFILE UPDATE
# =========================================================

class UserProfileUpdate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    phone: str = Field(
        ...,
        min_length=7,
        max_length=20,
    )


# =========================================================
# PRODUCT SCHEMAS
# =========================================================

class ProductCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
    )

    price: float = Field(
        ...,
        ge=0,
    )

    oldPrice: Optional[float] = Field(
        default=None,
        ge=0,
    )

    category: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    brand: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    condition: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    stock: int = Field(
        ...,
        ge=0,
    )

    rating: float = Field(
        default=0,
        ge=0,
        le=5,
    )

    reviews: int = Field(
        default=0,
        ge=0,
    )

    image: Optional[str] = None

    images: List[str] = Field(
        default_factory=list,
    )

    shortDescription: str = Field(
        ...,
        min_length=2,
        max_length=500,
    )

    description: str = Field(
        ...,
        min_length=2,
        max_length=5000,
    )

    specifications: Dict[str, str] = Field(
        default_factory=dict,
    )


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    price: Optional[float] = Field(
        default=None,
        ge=0,
    )

    oldPrice: Optional[float] = Field(
        default=None,
        ge=0,
    )

    category: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    brand: Optional[str] = Field(
        default=None,
        max_length=100,
    )

    condition: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    stock: Optional[int] = Field(
        default=None,
        ge=0,
    )

    rating: Optional[float] = Field(
        default=None,
        ge=0,
        le=5,
    )

    reviews: Optional[int] = Field(
        default=None,
        ge=0,
    )

    image: Optional[str] = None

    images: Optional[List[str]] = None

    shortDescription: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=500,
    )

    description: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=5000,
    )

    specifications: Optional[Dict[str, str]] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    price: float
    oldPrice: Optional[float] = None
    category: str
    brand: Optional[str] = None
    condition: str
    stock: int
    rating: float
    reviews: int
    image: Optional[str] = None
    images: List[str] = Field(
        default_factory=list,
    )
    shortDescription: str
    description: str
    specifications: Dict[str, str] = Field(
        default_factory=dict,
    )


# =========================================================
# ORDER SCHEMAS
# =========================================================

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int = Field(
        ...,
        ge=1,
    )
    price: float = Field(
        ...,
        ge=0,
    )
    image: Optional[str] = None


class OrderCreate(BaseModel):
    items: List[OrderItem] = Field(
        ...,
        min_length=1,
    )

    shipping_address: str = Field(
        ...,
        min_length=5,
        max_length=500,
    )

    phone: str = Field(
        ...,
        min_length=7,
        max_length=20,
    )

    payment_method: str = Field(
        default="Cash on Delivery",
        min_length=2,
        max_length=50,
    )


class OrderResponseItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    image: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderResponseItem]
    total_amount: float
    shipping_address: str
    phone: str
    payment_method: str
    status: str
    created_at: str