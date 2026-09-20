from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import orders_collection, users_collection

from schemas import (
    AuthResponse,
    OrderCreate,
    OrderResponse,
    UserLogin,
    UserProfileUpdate,
    UserRegister,
    UserResponse,
)

from security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# =========================================================
# AUTHENTICATION
# =========================================================

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Get the currently authenticated user from the JWT token.
    """

    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    try:
        from bson import ObjectId

        object_id = ObjectId(user_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in authentication token.",
        )

    existing_user = users_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )

    if not existing_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    return existing_user


# =========================================================
# ADMIN AUTHENTICATION
# =========================================================

def get_current_admin(
    current_user=Depends(get_current_user),
):
    """
    Allow access only to users whose role is admin.
    """

    user_role = current_user.get(
        "role",
        "customer",
    )

    if user_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(user: UserRegister):

    # Check whether email already exists
    existing_user = users_collection.find_one(
        {
            "email": user.email.lower(),
        }
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Create user document
    user_document = {
        "full_name": user.full_name.strip(),
        "email": user.email.lower(),
        "phone": user.phone.strip(),
        "password": hash_password(user.password),
        "role": "customer",
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    # Save user
    result = users_collection.insert_one(
        user_document
    )

    # Create JWT token
    access_token = create_access_token(
        {
            "sub": str(result.inserted_id),
            "email": user_document["email"],
            "role": user_document["role"],
        }
    )

    user_response = UserResponse(
        id=str(result.inserted_id),
        full_name=user_document["full_name"],
        email=user_document["email"],
        phone=user_document["phone"],
        role=user_document["role"],
        is_active=user_document["is_active"],
    )

    return AuthResponse(
        success=True,
        message="Registration successful.",
        access_token=access_token,
        user=user_response,
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login_user(user: UserLogin):

    # Find user by email
    existing_user = users_collection.find_one(
        {
            "email": user.email.lower(),
        }
    )

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Check account status
    if not existing_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )

    # Verify password
    if not verify_password(
        user.password,
        existing_user["password"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    # Create JWT token
    access_token = create_access_token(
        {
            "sub": str(existing_user["_id"]),
            "email": existing_user["email"],
            "role": existing_user.get("role", "customer"),
        }
    )

    user_response = UserResponse(
        id=str(existing_user["_id"]),
        full_name=existing_user["full_name"],
        email=existing_user["email"],
        phone=existing_user["phone"],
        role=existing_user.get("role", "customer"),
        is_active=existing_user.get("is_active", True),
    )

    return AuthResponse(
        success=True,
        message="Login successful.",
        access_token=access_token,
        user=user_response,
    )


# =========================================================
# CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_my_account(
    current_user=Depends(get_current_user),
):
    """
    Return the currently authenticated user's
    latest information from MongoDB.
    """

    return UserResponse(
        id=str(current_user["_id"]),
        full_name=current_user["full_name"],
        email=current_user["email"],
        phone=current_user["phone"],
        role=current_user.get("role", "customer"),
        is_active=current_user.get("is_active", True),
    )


# =========================================================
# UPDATE CURRENT USER PROFILE
# =========================================================

@router.put(
    "/me",
    response_model=UserResponse,
)
def update_my_account(
    profile: UserProfileUpdate,
    current_user=Depends(get_current_user),
):
    """
    Update the currently authenticated user's profile.

    Only full name and phone number can be changed here.
    Email, password, role, and account status are not changed.
    """

    updated_full_name = profile.full_name.strip()
    updated_phone = profile.phone.strip()

    # Update user in MongoDB
    users_collection.update_one(
        {
            "_id": current_user["_id"],
        },
        {
            "$set": {
                "full_name": updated_full_name,
                "phone": updated_phone,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    # Return the latest user information
    updated_user = users_collection.find_one(
        {
            "_id": current_user["_id"],
        }
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    return UserResponse(
        id=str(updated_user["_id"]),
        full_name=updated_user["full_name"],
        email=updated_user["email"],
        phone=updated_user["phone"],
        role=updated_user.get("role", "customer"),
        is_active=updated_user.get("is_active", True),
    )


# =========================================================
# CREATE ORDER
# =========================================================

@router.post(
    "/orders",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order: OrderCreate,
    current_user=Depends(get_current_user),
):
    """
    Create a new order for the currently authenticated user.
    """

    total_amount = sum(
        item.price * item.quantity
        for item in order.items
    )

    created_at = datetime.now(timezone.utc)

    order_document = {
        "user_id": str(current_user["_id"]),
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "price": item.price,
                "image": item.image,
            }
            for item in order.items
        ],
        "total_amount": total_amount,
        "shipping_address": order.shipping_address.strip(),
        "phone": order.phone.strip(),
        "payment_method": order.payment_method.strip(),
        "status": "Pending",
        "created_at": created_at,
    }

    result = orders_collection.insert_one(
        order_document
    )

    return OrderResponse(
        id=str(result.inserted_id),
        user_id=order_document["user_id"],
        items=order_document["items"],
        total_amount=order_document["total_amount"],
        shipping_address=order_document["shipping_address"],
        phone=order_document["phone"],
        payment_method=order_document["payment_method"],
        status=order_document["status"],
        created_at=created_at.isoformat(),
    )


# =========================================================
# GET MY ORDERS
# =========================================================

@router.get(
    "/orders",
    response_model=list[OrderResponse],
)
def get_my_orders(
    current_user=Depends(get_current_user),
):
    """
    Return only the orders belonging to the
    currently authenticated user.
    """

    user_id = str(current_user["_id"])

    orders = orders_collection.find(
        {
            "user_id": user_id,
        }
    ).sort(
        "created_at",
        -1,
    )

    response_orders = []

    for order in orders:

        created_at = order.get("created_at")

        if isinstance(created_at, datetime):
            created_at_string = created_at.isoformat()
        else:
            created_at_string = str(created_at)

        response_orders.append(
            OrderResponse(
                id=str(order["_id"]),
                user_id=order["user_id"],
                items=order.get(
                    "items",
                    [],
                ),
                total_amount=order.get(
                    "total_amount",
                    0,
                ),
                shipping_address=order.get(
                    "shipping_address",
                    "",
                ),
                phone=order.get(
                    "phone",
                    "",
                ),
                payment_method=order.get(
                    "payment_method",
                    "Cash on Delivery",
                ),
                status=order.get(
                    "status",
                    "Pending",
                ),
                created_at=created_at_string,
            )
        )

    return response_orders


# =========================================================
# ADMIN - GET ALL ORDERS
# =========================================================

@router.get(
    "/admin/orders",
    response_model=list[OrderResponse],
)
def get_all_orders(
    current_admin=Depends(get_current_admin),
):
    """
    Return all customer orders.

    Only authenticated admin users can access this endpoint.
    """

    orders = orders_collection.find().sort(
        "created_at",
        -1,
    )

    response_orders = []

    for order in orders:

        created_at = order.get("created_at")

        if isinstance(created_at, datetime):
            created_at_string = created_at.isoformat()
        else:
            created_at_string = str(created_at)

        response_orders.append(
            OrderResponse(
                id=str(order["_id"]),
                user_id=order["user_id"],
                items=order.get(
                    "items",
                    [],
                ),
                total_amount=order.get(
                    "total_amount",
                    0,
                ),
                shipping_address=order.get(
                    "shipping_address",
                    "",
                ),
                phone=order.get(
                    "phone",
                    "",
                ),
                payment_method=order.get(
                    "payment_method",
                    "Cash on Delivery",
                ),
                status=order.get(
                    "status",
                    "Pending",
                ),
                created_at=created_at_string,
            )
        )

    return response_orders


# =========================================================
# ADMIN - UPDATE ORDER STATUS
# =========================================================

@router.put(
    "/admin/orders/{order_id}/status",
    response_model=OrderResponse,
)
def update_order_status(
    order_id: str,
    new_status: str,
    current_admin=Depends(get_current_admin),
):
    """
    Update the status of a customer order.

    Only authenticated admin users can change order status.
    """

    allowed_statuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
    ]

    cleaned_status = new_status.strip()

    if cleaned_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid order status. "
                "Allowed statuses: "
                + ", ".join(allowed_statuses)
            ),
        )

    try:
        from bson import ObjectId

        object_id = ObjectId(order_id)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID.",
        )

    existing_order = orders_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not existing_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found.",
        )

    orders_collection.update_one(
        {
            "_id": object_id,
        },
        {
            "$set": {
                "status": cleaned_status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    updated_order = orders_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found after update.",
        )

    created_at = updated_order.get(
        "created_at"
    )

    if isinstance(created_at, datetime):
        created_at_string = created_at.isoformat()
    else:
        created_at_string = str(created_at)

    return OrderResponse(
        id=str(updated_order["_id"]),
        user_id=updated_order["user_id"],
        items=updated_order.get(
            "items",
            [],
        ),
        total_amount=updated_order.get(
            "total_amount",
            0,
        ),
        shipping_address=updated_order.get(
            "shipping_address",
            "",
        ),
        phone=updated_order.get(
            "phone",
            "",
        ),
        payment_method=updated_order.get(
            "payment_method",
            "Cash on Delivery",
        ),
        status=updated_order.get(
            "status",
            "Pending",
        ),
        created_at=created_at_string,
    )