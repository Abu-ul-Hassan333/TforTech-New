from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from auth import get_current_admin
from database import db


router = APIRouter(
    prefix="/api/header-footer",
    tags=["Header & Footer"],
)

header_footer_collection = db["header_footer_settings"]


DEFAULT_HEADER_FOOTER = {
    "header": {
        "announcement_text_1": "Free shipping on orders over PKR 5,000",
        "announcement_text_2": "Pakistan & Middle East",
        "logo_text_main": "T",
        "logo_text_secondary": "For Tech",
    },
    "footer": {
        "site_name": "GoJuniors",
        "description": (
            "Discover comfortable clothing, playful toys and accessories "
            "made for curious minds and growing hearts."
        ),
        "social_links": {
            "instagram": "https://instagram.com",
            "facebook": "https://facebook.com",
            "tiktok": "https://tiktok.com",
        },
        "shop": {
            "title": "Shop",
            "links": [
                {
                    "label": "All Products",
                    "url": "/shop",
                },
                {
                    "label": "Categories",
                    "url": "/categories",
                },
                {
                    "label": "New Arrivals",
                    "url": "/shop",
                },
                {
                    "label": "Bestsellers",
                    "url": "/shop",
                },
                {
                    "label": "On Sale",
                    "url": "/shop",
                },
            ],
        },
        "help": {
            "title": "Help",
            "links": [
                {
                    "label": "Shipping Information",
                    "url": "/shipping",
                },
                {
                    "label": "Returns & Exchanges",
                    "url": "/returns",
                },
                {
                    "label": "FAQs",
                    "url": "/faq",
                },
                {
                    "label": "Contact Us",
                    "url": "/contact",
                },
            ],
        },
        "company": {
            "title": "Company",
            "links": [
                {
                    "label": "About Us",
                    "url": "/about",
                },
                {
                    "label": "Contact",
                    "url": "/contact",
                },
                {
                    "label": "Privacy Policy",
                    "url": "/privacy",
                },
                {
                    "label": "Terms & Conditions",
                    "url": "/terms",
                },
            ],
        },
        "newsletter": {
            "title": "Stay in the loop",
            "description": (
                "Subscribe for new arrivals, special offers and updates."
            ),
            "input_placeholder": "Your email address",
            "button_text": "Subscribe",
        },
        "delivery": {
            "items": [
                {
                    "icon": "✓",
                    "title": "Quality Products",
                    "description": "Carefully selected for kids",
                },
                {
                    "icon": "🚚",
                    "title": "Free Shipping",
                    "description": "On orders over PKR 5,000",
                },
                {
                    "icon": "↩",
                    "title": "Easy Returns",
                    "description": "Simple return process",
                },
            ],
        },
        "bottom": {
            "copyright_text": "All rights reserved.",
            "privacy_label": "Privacy",
            "privacy_url": "/privacy",
            "terms_label": "Terms",
            "terms_url": "/terms",
            "contact_label": "Contact",
            "contact_url": "/contact",
        },
    },
}


class SocialLinks(BaseModel):
    instagram: str = Field(
        default=DEFAULT_HEADER_FOOTER["footer"]["social_links"]["instagram"],
        max_length=500,
    )
    facebook: str = Field(
        default=DEFAULT_HEADER_FOOTER["footer"]["social_links"]["facebook"],
        max_length=500,
    )
    tiktok: str = Field(
        default=DEFAULT_HEADER_FOOTER["footer"]["social_links"]["tiktok"],
        max_length=500,
    )


class FooterLink(BaseModel):
    label: str = Field(
        default="",
        max_length=100,
    )
    url: str = Field(
        default="",
        max_length=500,
    )


class FooterLinkSection(BaseModel):
    title: str = Field(
        default="",
        max_length=100,
    )
    links: List[FooterLink] = Field(
        default_factory=list,
    )


class NewsletterSettings(BaseModel):
    title: str = Field(
        default="Stay in the loop",
        max_length=150,
    )
    description: str = Field(
        default="",
        max_length=500,
    )
    input_placeholder: str = Field(
        default="Your email address",
        max_length=150,
    )
    button_text: str = Field(
        default="Subscribe",
        max_length=100,
    )


class DeliveryItem(BaseModel):
    icon: str = Field(
        default="",
        max_length=20,
    )
    title: str = Field(
        default="",
        max_length=100,
    )
    description: str = Field(
        default="",
        max_length=250,
    )


class DeliverySettings(BaseModel):
    items: List[DeliveryItem] = Field(
        default_factory=list,
    )


class FooterBottomSettings(BaseModel):
    copyright_text: str = Field(
        default="All rights reserved.",
        max_length=250,
    )
    privacy_label: str = Field(
        default="Privacy",
        max_length=100,
    )
    privacy_url: str = Field(
        default="/privacy",
        max_length=500,
    )
    terms_label: str = Field(
        default="Terms",
        max_length=100,
    )
    terms_url: str = Field(
        default="/terms",
        max_length=500,
    )
    contact_label: str = Field(
        default="Contact",
        max_length=100,
    )
    contact_url: str = Field(
        default="/contact",
        max_length=500,
    )


class HeaderSettings(BaseModel):
    announcement_text_1: str = Field(
        default=DEFAULT_HEADER_FOOTER["header"]["announcement_text_1"],
        max_length=250,
    )
    announcement_text_2: str = Field(
        default=DEFAULT_HEADER_FOOTER["header"]["announcement_text_2"],
        max_length=250,
    )
    logo_text_main: str = Field(
        default=DEFAULT_HEADER_FOOTER["header"]["logo_text_main"],
        max_length=50,
    )
    logo_text_secondary: str = Field(
        default=DEFAULT_HEADER_FOOTER["header"]["logo_text_secondary"],
        max_length=100,
    )


class FooterSettings(BaseModel):
    site_name: str = Field(
        default=DEFAULT_HEADER_FOOTER["footer"]["site_name"],
        max_length=100,
    )
    description: str = Field(
        default=DEFAULT_HEADER_FOOTER["footer"]["description"],
        max_length=1000,
    )
    social_links: SocialLinks = Field(
        default_factory=SocialLinks,
    )
    shop: FooterLinkSection = Field(
        default_factory=lambda: FooterLinkSection(
            **DEFAULT_HEADER_FOOTER["footer"]["shop"]
        )
    )
    help: FooterLinkSection = Field(
        default_factory=lambda: FooterLinkSection(
            **DEFAULT_HEADER_FOOTER["footer"]["help"]
        )
    )
    company: FooterLinkSection = Field(
        default_factory=lambda: FooterLinkSection(
            **DEFAULT_HEADER_FOOTER["footer"]["company"]
        )
    )
    newsletter: NewsletterSettings = Field(
        default_factory=NewsletterSettings,
    )
    delivery: DeliverySettings = Field(
        default_factory=lambda: DeliverySettings(
            **DEFAULT_HEADER_FOOTER["footer"]["delivery"]
        )
    )
    bottom: FooterBottomSettings = Field(
        default_factory=lambda: FooterBottomSettings(
            **DEFAULT_HEADER_FOOTER["footer"]["bottom"]
        )
    )


class HeaderFooterSettingsUpdate(BaseModel):
    header: HeaderSettings = Field(
        default_factory=HeaderSettings,
    )
    footer: FooterSettings = Field(
        default_factory=FooterSettings,
    )


def deep_merge_defaults(
    existing: Optional[dict],
    defaults: dict,
) -> dict:
    if not isinstance(existing, dict):
        return defaults.copy()

    result = {}

    for key, default_value in defaults.items():
        existing_value = existing.get(key)

        if isinstance(default_value, dict):
            result[key] = deep_merge_defaults(
                existing_value,
                default_value,
            )

        elif isinstance(default_value, list):
            if isinstance(existing_value, list):
                result[key] = existing_value
            else:
                result[key] = default_value.copy()

        else:
            if existing_value is None:
                result[key] = default_value
            else:
                result[key] = existing_value

    for key, value in existing.items():
        if key not in result:
            result[key] = value

    return result


def serialize_header_footer(
    settings: Optional[dict],
) -> dict:
    if not settings:
        return {
            "success": True,
            "settings": deep_merge_defaults(
                {},
                DEFAULT_HEADER_FOOTER,
            ),
        }

    result = deep_merge_defaults(
        settings,
        DEFAULT_HEADER_FOOTER,
    )

    result.pop("_id", None)
    result.pop("created_at", None)
    result.pop("updated_at", None)

    return {
        "success": True,
        "settings": result,
    }


def get_or_create_header_footer() -> dict:
    settings = header_footer_collection.find_one({})

    if settings:
        return settings

    now = datetime.now(timezone.utc)

    new_settings = {
        "header": deep_merge_defaults(
            {},
            DEFAULT_HEADER_FOOTER["header"],
        ),
        "footer": deep_merge_defaults(
            {},
            DEFAULT_HEADER_FOOTER["footer"],
        ),
        "created_at": now,
        "updated_at": now,
    }

    try:
        header_footer_collection.insert_one(
            new_settings
        )

    except PyMongoError as error:
        print(
            f"Error creating default header/footer settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create default header/footer settings.",
        )

    return new_settings


@router.get("/public")
def get_public_header_footer():
    try:
        settings = get_or_create_header_footer()

        return serialize_header_footer(
            settings
        )

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error loading public header/footer settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load header/footer settings.",
        )


@router.get("/settings")
def get_header_footer_settings(
    current_admin=Depends(get_current_admin),
):
    try:
        settings = get_or_create_header_footer()

        return serialize_header_footer(
            settings
        )

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error loading header/footer settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load header/footer settings.",
        )


@router.put("/settings")
def update_header_footer_settings(
    settings_data: HeaderFooterSettingsUpdate,
    current_admin=Depends(get_current_admin),
):
    now = datetime.now(timezone.utc)

    update_data = {
        "header": {
            "announcement_text_1":
                settings_data.header.announcement_text_1.strip(),

            "announcement_text_2":
                settings_data.header.announcement_text_2.strip(),

            "logo_text_main":
                settings_data.header.logo_text_main.strip(),

            "logo_text_secondary":
                settings_data.header.logo_text_secondary.strip(),
        },

        "footer": {
            "site_name":
                settings_data.footer.site_name.strip(),

            "description":
                settings_data.footer.description.strip(),

            "social_links": {
                "instagram":
                    settings_data.footer.social_links.instagram.strip(),

                "facebook":
                    settings_data.footer.social_links.facebook.strip(),

                "tiktok":
                    settings_data.footer.social_links.tiktok.strip(),
            },

            "shop": {
                "title":
                    settings_data.footer.shop.title.strip(),

                "links": [
                    {
                        "label": link.label.strip(),
                        "url": link.url.strip(),
                    }
                    for link in settings_data.footer.shop.links
                ],
            },

            "help": {
                "title":
                    settings_data.footer.help.title.strip(),

                "links": [
                    {
                        "label": link.label.strip(),
                        "url": link.url.strip(),
                    }
                    for link in settings_data.footer.help.links
                ],
            },

            "company": {
                "title":
                    settings_data.footer.company.title.strip(),

                "links": [
                    {
                        "label": link.label.strip(),
                        "url": link.url.strip(),
                    }
                    for link in settings_data.footer.company.links
                ],
            },

            "newsletter": {
                "title":
                    settings_data.footer.newsletter.title.strip(),

                "description":
                    settings_data.footer.newsletter.description.strip(),

                "input_placeholder":
                    settings_data.footer.newsletter.input_placeholder.strip(),

                "button_text":
                    settings_data.footer.newsletter.button_text.strip(),
            },

            "delivery": {
                "items": [
                    {
                        "icon": item.icon.strip(),
                        "title": item.title.strip(),
                        "description": item.description.strip(),
                    }
                    for item in settings_data.footer.delivery.items
                ],
            },

            "bottom": {
                "copyright_text":
                    settings_data.footer.bottom.copyright_text.strip(),

                "privacy_label":
                    settings_data.footer.bottom.privacy_label.strip(),

                "privacy_url":
                    settings_data.footer.bottom.privacy_url.strip(),

                "terms_label":
                    settings_data.footer.bottom.terms_label.strip(),

                "terms_url":
                    settings_data.footer.bottom.terms_url.strip(),

                "contact_label":
                    settings_data.footer.bottom.contact_label.strip(),

                "contact_url":
                    settings_data.footer.bottom.contact_url.strip(),
            },
        },

        "updated_at": now,
    }

    try:
        existing_settings = header_footer_collection.find_one({})

        if existing_settings:
            header_footer_collection.update_one(
                {"_id": existing_settings["_id"]},
                {"$set": update_data},
            )
        else:
            update_data["created_at"] = now

            header_footer_collection.insert_one(
                update_data
            )

        updated_settings = header_footer_collection.find_one({})

        return {
            "success": True,
            "message": "Header and footer settings saved successfully.",
            "settings": serialize_header_footer(
                updated_settings
            )["settings"],
        }

    except PyMongoError as error:
        print(
            f"Error saving header/footer settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save header/footer settings.",
        )


@router.post("/settings/reset")
def reset_header_footer_settings(
    current_admin=Depends(get_current_admin),
):
    now = datetime.now(timezone.utc)

    reset_data = {
        "header": deep_merge_defaults(
            {},
            DEFAULT_HEADER_FOOTER["header"],
        ),
        "footer": deep_merge_defaults(
            {},
            DEFAULT_HEADER_FOOTER["footer"],
        ),
        "updated_at": now,
    }

    try:
        existing_settings = header_footer_collection.find_one({})

        if existing_settings:
            header_footer_collection.update_one(
                {"_id": existing_settings["_id"]},
                {"$set": reset_data},
            )
        else:
            reset_data["created_at"] = now

            header_footer_collection.insert_one(
                reset_data
            )

        updated_settings = header_footer_collection.find_one({})

        return {
            "success": True,
            "message": (
                "Header and footer settings have been reset "
                "to default successfully."
            ),
            "settings": serialize_header_footer(
                updated_settings
            )["settings"],
        }

    except PyMongoError as error:
        print(
            f"Error resetting header/footer settings: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset header/footer settings.",
        )