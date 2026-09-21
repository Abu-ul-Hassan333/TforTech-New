from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from auth import get_current_admin
from database import db


# ============================================================
# HERO ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/hero",
    tags=["Hero"],
)


# ============================================================
# MONGODB COLLECTION
# ============================================================

hero_settings_collection = db["hero_settings"]


# ============================================================
# MEDIA LIMITS
# ============================================================

MAX_IMAGE_LENGTH = 8_000_000

MAX_VIDEO_LENGTH = 14_000_000


# ============================================================
# DEFAULT HERO
#
# Existing Home.jsx Hero content is preserved.
# Video is optional.
# ============================================================

DEFAULT_HERO = {
    "enabled": True,

    "badge": "PREMIUM LAPTOPS & ACCESSORIES",

    "title": "Technology That Fits Your World",

    "description": (
        "Discover reliable laptops, gaming machines and "
        "essential accessories for work, study, gaming "
        "and everyday life."
    ),

    "primary_button_text": "View Products",
    "primary_button_link": "/products",

    "secondary_button_text": "Explore Categories",
    "secondary_button_link": "/categories",

    # Existing Hero image.
    "image": "",

    # New optional Hero video.
    "video_enabled": False,
    "video": "",

    # Hero visual settings.
    "overlay_opacity": 0.78,
    "image_position": "center",
}


# ============================================================
# PYDANTIC MODEL
# ============================================================

class HeroSettingsUpdate(BaseModel):
    enabled: bool = DEFAULT_HERO["enabled"]

    badge: str = Field(
        default=DEFAULT_HERO["badge"],
        max_length=120,
    )

    title: str = Field(
        default=DEFAULT_HERO["title"],
        max_length=200,
    )

    description: str = Field(
        default=DEFAULT_HERO["description"],
        max_length=1500,
    )

    primary_button_text: str = Field(
        default=DEFAULT_HERO["primary_button_text"],
        max_length=80,
    )

    primary_button_link: str = Field(
        default=DEFAULT_HERO["primary_button_link"],
        max_length=500,
    )

    secondary_button_text: str = Field(
        default=DEFAULT_HERO["secondary_button_text"],
        max_length=80,
    )

    secondary_button_link: str = Field(
        default=DEFAULT_HERO["secondary_button_link"],
        max_length=500,
    )

    image: str = Field(
        default=DEFAULT_HERO["image"],
        max_length=MAX_IMAGE_LENGTH,
    )

    video_enabled: bool = DEFAULT_HERO["video_enabled"]

    video: str = Field(
        default=DEFAULT_HERO["video"],
        max_length=MAX_VIDEO_LENGTH,
    )

    overlay_opacity: float = Field(
        default=DEFAULT_HERO["overlay_opacity"],
        ge=0,
        le=1,
    )

    image_position: str = Field(
        default=DEFAULT_HERO["image_position"],
        max_length=50,
    )


# ============================================================
# HELPERS
# ============================================================

def clean_text(value: str) -> str:
    """
    Trim text before saving it to MongoDB.
    """
    return (value or "").strip()


def serialize_hero(hero: dict | None) -> dict:
    """
    Convert MongoDB Hero document into a clean API response.
    """

    if not hero:
        clean_hero = {
            key: value
            for key, value in DEFAULT_HERO.items()
        }

        clean_hero.pop("created_at", None)
        clean_hero.pop("updated_at", None)

        return {
            "success": True,
            "hero": clean_hero,
        }

    result = dict(hero)

    result.pop("_id", None)
    result.pop("created_at", None)
    result.pop("updated_at", None)

    # --------------------------------------------------------
    # Backward compatibility
    #
    # Old Hero documents created before video support will
    # automatically receive the safe default video fields.
    # --------------------------------------------------------

    for key, default_value in DEFAULT_HERO.items():
        if key not in result:
            result[key] = default_value

    return {
        "success": True,
        "hero": result,
    }


def get_or_create_hero() -> dict:
    """
    Return the existing Hero settings.

    If no Hero record exists, create the default record.
    """

    hero = hero_settings_collection.find_one({})

    if hero:
        return hero

    now = datetime.now(timezone.utc)

    new_hero = {
        key: value
        for key, value in DEFAULT_HERO.items()
    }

    new_hero["created_at"] = now
    new_hero["updated_at"] = now

    try:
        hero_settings_collection.insert_one(
            new_hero
        )

    except PyMongoError as error:
        print(
            f"Error creating default Hero settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create default Hero settings.",
        )

    return new_hero


# ============================================================
# PUBLIC HERO API
# ============================================================

@router.get("/public")
def get_public_hero():
    """
    Public Hero endpoint.

    The homepage can call this without authentication.
    """

    try:
        hero = get_or_create_hero()

        return serialize_hero(hero)

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error loading public Hero settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load Hero settings.",
        )


# ============================================================
# ADMIN GET HERO
# ============================================================

@router.get("/settings")
def get_hero_settings(
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only Hero settings endpoint.
    """

    try:
        hero = get_or_create_hero()

        return serialize_hero(hero)

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error loading Hero settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load Hero settings.",
        )


# ============================================================
# ADMIN UPDATE HERO
# ============================================================

@router.put("/settings")
def update_hero_settings(
    hero_data: HeroSettingsUpdate,
    current_admin=Depends(get_current_admin),
):
    """
    Save Hero settings.
    """

    now = datetime.now(timezone.utc)

    image_value = clean_text(
        hero_data.image
    )

    video_value = clean_text(
        hero_data.video
    )

    # --------------------------------------------------------
    # MEDIA SIZE VALIDATION
    # --------------------------------------------------------

    if len(image_value) > MAX_IMAGE_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Hero image data is too large.",
        )

    if len(video_value) > MAX_VIDEO_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Hero video data is too large.",
        )

    # --------------------------------------------------------
    # REQUIRED TEXT DATA
    # --------------------------------------------------------

    update_data = {
        "enabled": bool(
            hero_data.enabled
        ),

        "badge": clean_text(
            hero_data.badge
        ),

        "title": clean_text(
            hero_data.title
        ),

        "description": clean_text(
            hero_data.description
        ),

        "primary_button_text": clean_text(
            hero_data.primary_button_text
        ),

        "primary_button_link": clean_text(
            hero_data.primary_button_link
        ),

        "secondary_button_text": clean_text(
            hero_data.secondary_button_text
        ),

        "secondary_button_link": clean_text(
            hero_data.secondary_button_link
        ),

        "image": image_value,

        "video_enabled": bool(
            hero_data.video_enabled
        ),

        "video": video_value,

        "overlay_opacity": hero_data.overlay_opacity,

        "image_position": clean_text(
            hero_data.image_position
        ) or "center",

        "updated_at": now,
    }

    # --------------------------------------------------------
    # REQUIRED FIELD VALIDATION
    # --------------------------------------------------------

    if not update_data["title"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Hero title is required.",
        )

    if not update_data["description"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Hero description is required.",
        )

    if not update_data["primary_button_text"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Primary button text is required.",
        )

    if not update_data["primary_button_link"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Primary button link is required.",
        )

    if not update_data["secondary_button_text"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Secondary button text is required.",
        )

    if not update_data["secondary_button_link"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Secondary button link is required.",
        )

    # --------------------------------------------------------
    # VIDEO VALIDATION
    #
    # Video itself is optional.
    # When enabled, a video must exist.
    #
    # Duration validation for local gallery videos is handled
    # in the frontend because the browser can inspect media
    # metadata before uploading the Base64 data.
    # --------------------------------------------------------

    if (
        update_data["video_enabled"]
        and not update_data["video"]
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "Hero video must be provided when "
                "background video is enabled."
            ),
        )

    try:
        existing_hero = hero_settings_collection.find_one({})

        if existing_hero:
            hero_settings_collection.update_one(
                {"_id": existing_hero["_id"]},
                {
                    "$set": update_data
                },
            )

        else:
            update_data["created_at"] = now

            hero_settings_collection.insert_one(
                update_data
            )

        updated_hero = hero_settings_collection.find_one({})

        return {
            "success": True,
            "message": "Hero settings saved successfully.",
            "hero": serialize_hero(
                updated_hero
            )["hero"],
        }

    except PyMongoError as error:
        print(
            f"Error saving Hero settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save Hero settings.",
        )


# ============================================================
# ADMIN RESET HERO
# ============================================================

@router.post("/settings/reset")
def reset_hero_settings(
    current_admin=Depends(get_current_admin),
):
    """
    Restore the complete default Hero settings.
    """

    now = datetime.now(timezone.utc)

    reset_data = {
        key: value
        for key, value in DEFAULT_HERO.items()
    }

    reset_data["updated_at"] = now

    try:
        existing_hero = hero_settings_collection.find_one({})

        if existing_hero:
            hero_settings_collection.update_one(
                {"_id": existing_hero["_id"]},
                {
                    "$set": reset_data
                },
            )

        else:
            reset_data["created_at"] = now

            hero_settings_collection.insert_one(
                reset_data
            )

        updated_hero = hero_settings_collection.find_one({})

        return {
            "success": True,
            "message": (
                "Hero has been reset to default successfully."
            ),
            "hero": serialize_hero(
                updated_hero
            )["hero"],
        }

    except PyMongoError as error:
        print(
            f"Error resetting Hero settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset Hero settings.",
        )