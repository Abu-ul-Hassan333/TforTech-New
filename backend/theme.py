from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from auth import get_current_admin
from database import db


router = APIRouter(
    prefix="/api/theme",
    tags=["Theme"],
)


theme_settings_collection = db["theme_settings"]


# ============================================================
# DEFAULT THEME
# ============================================================

DEFAULT_THEME = {
    "site_name": "GoJuniors",
    "primary_color": "#111827",
    "secondary_color": "#2563eb",
    "accent_color": "#25d366",
    "background_color": "#ffffff",
    "surface_color": "#f7f8fb",
    "text_color": "#111827",
    "muted_text_color": "#6b7280",
    "button_text_color": "#ffffff",
    "border_color": "#e5e7eb",
    "header_background": "#111827",
    "header_text_color": "#ffffff",
    "footer_background": "#111827",
    "footer_text_color": "#ffffff",
    "font_family": "Inter",
    "border_radius": "12px",
    "button_radius": "8px",
    "container_width": "1180px",
    "show_site_name": True,
    "show_footer": True,
    "show_breadcrumbs": True,
}


# ============================================================
# PYDANTIC MODEL
# ============================================================

class ThemeSettingsUpdate(BaseModel):
    site_name: str = Field(
        default=DEFAULT_THEME["site_name"],
        max_length=100,
    )

    primary_color: str = Field(
        default=DEFAULT_THEME["primary_color"],
        max_length=20,
    )

    secondary_color: str = Field(
        default=DEFAULT_THEME["secondary_color"],
        max_length=20,
    )

    accent_color: str = Field(
        default=DEFAULT_THEME["accent_color"],
        max_length=20,
    )

    background_color: str = Field(
        default=DEFAULT_THEME["background_color"],
        max_length=20,
    )

    surface_color: str = Field(
        default=DEFAULT_THEME["surface_color"],
        max_length=20,
    )

    text_color: str = Field(
        default=DEFAULT_THEME["text_color"],
        max_length=20,
    )

    muted_text_color: str = Field(
        default=DEFAULT_THEME["muted_text_color"],
        max_length=20,
    )

    button_text_color: str = Field(
        default=DEFAULT_THEME["button_text_color"],
        max_length=20,
    )

    border_color: str = Field(
        default=DEFAULT_THEME["border_color"],
        max_length=20,
    )

    header_background: str = Field(
        default=DEFAULT_THEME["header_background"],
        max_length=20,
    )

    header_text_color: str = Field(
        default=DEFAULT_THEME["header_text_color"],
        max_length=20,
    )

    footer_background: str = Field(
        default=DEFAULT_THEME["footer_background"],
        max_length=20,
    )

    footer_text_color: str = Field(
        default=DEFAULT_THEME["footer_text_color"],
        max_length=20,
    )

    font_family: str = Field(
        default=DEFAULT_THEME["font_family"],
        max_length=100,
    )

    border_radius: str = Field(
        default=DEFAULT_THEME["border_radius"],
        max_length=20,
    )

    button_radius: str = Field(
        default=DEFAULT_THEME["button_radius"],
        max_length=20,
    )

    container_width: str = Field(
        default=DEFAULT_THEME["container_width"],
        max_length=20,
    )

    show_site_name: bool = DEFAULT_THEME["show_site_name"]
    show_footer: bool = DEFAULT_THEME["show_footer"]
    show_breadcrumbs: bool = DEFAULT_THEME["show_breadcrumbs"]


# ============================================================
# HELPERS
# ============================================================

def serialize_theme(theme: Optional[dict]) -> dict:
    """
    Convert MongoDB theme document into a clean API response.
    """

    if not theme:
        return {
            "success": True,
            "theme": DEFAULT_THEME.copy(),
        }

    result = dict(theme)

    result.pop("_id", None)
    result.pop("created_at", None)
    result.pop("updated_at", None)

    for key, default_value in DEFAULT_THEME.items():
        if key not in result:
            result[key] = default_value

    return {
        "success": True,
        "theme": result,
    }


def get_or_create_theme() -> dict:
    """
    Get the existing theme.
    If no theme exists, create the default theme.
    """

    theme = theme_settings_collection.find_one({})

    if theme:
        return theme

    now = datetime.now(timezone.utc)

    new_theme = {
        **DEFAULT_THEME,
        "created_at": now,
        "updated_at": now,
    }

    try:
        theme_settings_collection.insert_one(new_theme)
    except PyMongoError as error:
        print(f"Error creating default theme: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create default theme.",
        )

    return new_theme


# ============================================================
# PUBLIC THEME API
# ============================================================

@router.get("/public")
def get_public_theme():
    """
    Public endpoint.
    Frontend/customer pages can use this endpoint
    without admin authentication.
    """

    try:
        theme = get_or_create_theme()

        return serialize_theme(theme)

    except HTTPException:
        raise

    except PyMongoError as error:
        print(f"Error loading public theme: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load theme.",
        )


# ============================================================
# ADMIN GET THEME
# ============================================================

@router.get("/settings")
def get_theme_settings(
    current_admin=Depends(get_current_admin),
):
    """
    Admin-only theme settings endpoint.
    """

    try:
        theme = get_or_create_theme()

        return serialize_theme(theme)

    except HTTPException:
        raise

    except PyMongoError as error:
        print(f"Error loading theme settings: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load theme settings.",
        )


# ============================================================
# ADMIN UPDATE THEME
# ============================================================

@router.put("/settings")
def update_theme_settings(
    theme_data: ThemeSettingsUpdate,
    current_admin=Depends(get_current_admin),
):
    """
    Save theme settings.
    """

    now = datetime.now(timezone.utc)

    update_data = {
        "site_name": theme_data.site_name.strip(),

        "primary_color": theme_data.primary_color.strip(),
        "secondary_color": theme_data.secondary_color.strip(),
        "accent_color": theme_data.accent_color.strip(),

        "background_color": theme_data.background_color.strip(),
        "surface_color": theme_data.surface_color.strip(),

        "text_color": theme_data.text_color.strip(),
        "muted_text_color": theme_data.muted_text_color.strip(),

        "button_text_color": theme_data.button_text_color.strip(),
        "border_color": theme_data.border_color.strip(),

        "header_background": theme_data.header_background.strip(),
        "header_text_color": theme_data.header_text_color.strip(),

        "footer_background": theme_data.footer_background.strip(),
        "footer_text_color": theme_data.footer_text_color.strip(),

        "font_family": theme_data.font_family.strip(),

        "border_radius": theme_data.border_radius.strip(),
        "button_radius": theme_data.button_radius.strip(),
        "container_width": theme_data.container_width.strip(),

        "show_site_name": theme_data.show_site_name,
        "show_footer": theme_data.show_footer,
        "show_breadcrumbs": theme_data.show_breadcrumbs,

        "updated_at": now,
    }

    try:
        existing_theme = theme_settings_collection.find_one({})

        if existing_theme:
            theme_settings_collection.update_one(
                {"_id": existing_theme["_id"]},
                {"$set": update_data},
            )

        else:
            update_data["created_at"] = now

            theme_settings_collection.insert_one(
                update_data
            )

        updated_theme = theme_settings_collection.find_one({})

        return {
            "success": True,
            "message": "Theme settings saved successfully.",
            "theme": serialize_theme(
                updated_theme
            )["theme"],
        }

    except PyMongoError as error:
        print(f"Error saving theme settings: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save theme settings.",
        )


# ============================================================
# ADMIN RESET THEME
# ============================================================

@router.post("/settings/reset")
def reset_theme_settings(
    current_admin=Depends(get_current_admin),
):
    """
    Restore the complete default theme.
    """

    now = datetime.now(timezone.utc)

    reset_data = {
        **DEFAULT_THEME,
        "updated_at": now,
    }

    try:
        existing_theme = theme_settings_collection.find_one({})

        if existing_theme:
            theme_settings_collection.update_one(
                {"_id": existing_theme["_id"]},
                {"$set": reset_data},
            )

        else:
            reset_data["created_at"] = now

            theme_settings_collection.insert_one(
                reset_data
            )

        updated_theme = theme_settings_collection.find_one({})

        return {
            "success": True,
            "message": "Theme has been reset to default successfully.",
            "theme": serialize_theme(
                updated_theme
            )["theme"],
        }

    except PyMongoError as error:
        print(f"Error resetting theme settings: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset theme settings.",
        )