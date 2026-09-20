from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from auth import get_current_admin
from database import db


# ============================================================
# GOJUNIORS - WHATSAPP ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/whatsapp",
    tags=["WhatsApp"],
)


# ============================================================
# MONGODB COLLECTION
# ============================================================

whatsapp_settings_collection = db["whatsapp_settings"]


# ============================================================
# PYDANTIC MODELS
# ============================================================

class WhatsAppSettingsUpdate(BaseModel):
    """
    Admin WhatsApp settings.
    """

    order_enabled: bool = True
    order_phone: str = Field(
        default="",
        max_length=30,
    )

    floating_enabled: bool = True
    floating_phone: str = Field(
        default="",
        max_length=30,
    )

    order_message: str = Field(
        default=(
            "Hello GoJuniors, I want to place an order."
        ),
        max_length=2000,
    )

    product_message: str = Field(
        default=(
            "Hello GoJuniors, I am interested in this product."
        ),
        max_length=2000,
    )

    floating_message: str = Field(
        default=(
            "Hello GoJuniors, I need some help."
        ),
        max_length=2000,
    )

    floating_position: str = Field(
        default="bottom-right",
        max_length=30,
    )

    floating_label: str = Field(
        default="Chat on WhatsApp",
        max_length=100,
    )


# ============================================================
# DEFAULT SETTINGS
# ============================================================

DEFAULT_SETTINGS = {
    "order_enabled": True,
    "order_phone": "",
    "floating_enabled": True,
    "floating_phone": "",
    "order_message": (
        "Hello GoJuniors, I want to place an order."
    ),
    "product_message": (
        "Hello GoJuniors, I am interested in this product."
    ),
    "floating_message": (
        "Hello GoJuniors, I need some help."
    ),
    "floating_position": "bottom-right",
    "floating_label": "Chat on WhatsApp",
}


# ============================================================
# HELPERS
# ============================================================

def clean_phone_number(phone: str) -> str:
    """
    Remove characters that are not useful in a WhatsApp
    wa.me phone number.

    Example:
        +92 300-1234567
    becomes:
        923001234567
    """

    if not phone:
        return ""

    cleaned = "".join(
        character
        for character in phone
        if character.isdigit()
    )

    return cleaned


def serialize_settings(settings: Optional[dict]) -> dict:
    """
    Convert MongoDB document into a frontend-safe object.
    """

    if not settings:
        return {
            "success": True,
            "settings": DEFAULT_SETTINGS.copy(),
        }

    result = dict(settings)

    result.pop("_id", None)

    for key, default_value in DEFAULT_SETTINGS.items():
        if key not in result:
            result[key] = default_value

    return {
        "success": True,
        "settings": result,
    }


def get_or_create_settings() -> dict:
    """
    Get WhatsApp settings from MongoDB.

    If no settings document exists yet, create one
    automatically with the default settings.
    """

    settings = whatsapp_settings_collection.find_one({})

    if settings:
        return settings

    now = datetime.now(timezone.utc)

    new_settings = {
        **DEFAULT_SETTINGS,
        "created_at": now,
        "updated_at": now,
    }

    try:
        whatsapp_settings_collection.insert_one(
            new_settings
        )
    except PyMongoError as error:
        print(
            f"Error creating WhatsApp settings: {error}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create WhatsApp settings.",
        )

    return new_settings


# ============================================================
# PUBLIC - GET WHATSAPP SETTINGS
# ============================================================

@router.get("/settings")
def get_whatsapp_settings():
    """
    Public endpoint.

    Customer-facing pages use this endpoint to know:

    - Whether Order on WhatsApp is enabled
    - Order WhatsApp number
    - Whether floating WhatsApp is enabled
    - Floating WhatsApp number
    - Default WhatsApp messages
    """

    try:
        settings = get_or_create_settings()

        return serialize_settings(settings)

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error loading WhatsApp settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load WhatsApp settings.",
        )


# ============================================================
# PUBLIC - GET CUSTOMER WHATSAPP CONFIG
# ============================================================

@router.get("/public")
def get_public_whatsapp_settings():
    """
    Public customer-facing WhatsApp configuration.

    This endpoint intentionally returns only settings required
    by the customer-facing website.
    """

    try:
        settings = get_or_create_settings()

        return {
            "success": True,
            "order": {
                "enabled": bool(
                    settings.get(
                        "order_enabled",
                        True,
                    )
                ),
                "phone": clean_phone_number(
                    settings.get(
                        "order_phone",
                        "",
                    )
                ),
                "message": settings.get(
                    "order_message",
                    DEFAULT_SETTINGS["order_message"],
                ),
                "productMessage": settings.get(
                    "product_message",
                    DEFAULT_SETTINGS["product_message"],
                ),
            },
            "floating": {
                "enabled": bool(
                    settings.get(
                        "floating_enabled",
                        True,
                    )
                ),
                "phone": clean_phone_number(
                    settings.get(
                        "floating_phone",
                        "",
                    )
                ),
                "message": settings.get(
                    "floating_message",
                    DEFAULT_SETTINGS["floating_message"],
                ),
                "position": settings.get(
                    "floating_position",
                    "bottom-right",
                ),
                "label": settings.get(
                    "floating_label",
                    "Chat on WhatsApp",
                ),
            },
        }

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error loading public WhatsApp settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load WhatsApp configuration.",
        )


# ============================================================
# ADMIN - UPDATE WHATSAPP SETTINGS
# ============================================================

@router.put("/settings")
def update_whatsapp_settings(
    settings_data: WhatsAppSettingsUpdate,
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint for saving WhatsApp settings.
    """

    order_phone = clean_phone_number(
        settings_data.order_phone
    )

    floating_phone = clean_phone_number(
        settings_data.floating_phone
    )

    if settings_data.order_enabled and not order_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Order WhatsApp number is required "
                "when Order on WhatsApp is enabled."
            ),
        )

    if (
        settings_data.floating_enabled
        and not floating_phone
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Floating WhatsApp number is required "
                "when floating WhatsApp is enabled."
            ),
        )

    if settings_data.floating_position not in [
        "bottom-right",
        "bottom-left",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Floating WhatsApp position must be "
                "bottom-right or bottom-left."
            ),
        )

    now = datetime.now(timezone.utc)

    update_data = {
        "order_enabled": settings_data.order_enabled,
        "order_phone": order_phone,
        "floating_enabled": settings_data.floating_enabled,
        "floating_phone": floating_phone,
        "order_message": settings_data.order_message.strip(),
        "product_message": (
            settings_data.product_message.strip()
        ),
        "floating_message": (
            settings_data.floating_message.strip()
        ),
        "floating_position": (
            settings_data.floating_position
        ),
        "floating_label": (
            settings_data.floating_label.strip()
        ),
        "updated_at": now,
    }

    try:
        existing = whatsapp_settings_collection.find_one({})

        if existing:
            whatsapp_settings_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": update_data,
                },
            )
        else:
            update_data["created_at"] = now

            whatsapp_settings_collection.insert_one(
                update_data
            )

        updated_settings = (
            whatsapp_settings_collection.find_one({})
        )

        return {
            "success": True,
            "message": (
                "WhatsApp settings saved successfully."
            ),
            "settings": serialize_settings(
                updated_settings
            )["settings"],
        }

    except PyMongoError as error:
        print(
            f"Error saving WhatsApp settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save WhatsApp settings.",
        )


# ============================================================
# ADMIN - RESET WHATSAPP SETTINGS
# ============================================================

@router.post("/settings/reset")
def reset_whatsapp_settings(
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only endpoint to reset WhatsApp settings
    to their default values.
    """

    now = datetime.now(timezone.utc)

    reset_data = {
        **DEFAULT_SETTINGS,
        "updated_at": now,
    }

    try:
        existing = whatsapp_settings_collection.find_one({})

        if existing:
            whatsapp_settings_collection.update_one(
                {"_id": existing["_id"]},
                {
                    "$set": reset_data,
                },
            )
        else:
            reset_data["created_at"] = now

            whatsapp_settings_collection.insert_one(
                reset_data
            )

        updated_settings = (
            whatsapp_settings_collection.find_one({})
        )

        return {
            "success": True,
            "message": (
                "WhatsApp settings reset successfully."
            ),
            "settings": serialize_settings(
                updated_settings
            )["settings"],
        }

    except PyMongoError as error:
        print(
            f"Error resetting WhatsApp settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset WhatsApp settings.",
        )