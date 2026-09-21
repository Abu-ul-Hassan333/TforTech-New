from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from pymongo.errors import PyMongoError

from database import products_collection
from auth import get_current_product_order_admin


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


# ============================================================
# SERIALIZATION
# ============================================================

def serialize_product(product: dict) -> dict:
    if not product:
        return product

    product = dict(product)

    if "_id" in product:
        product["id"] = str(product.pop("_id"))

    product["is_featured"] = bool(
        product.get("is_featured", False)
    )

    existing_images = product.get("images")

    if isinstance(existing_images, list):
        product["images"] = [
            str(image)
            for image in existing_images
            if image
        ]
    else:
        primary_image = product.get("image")

        if primary_image:
            product["images"] = [
                str(primary_image)
            ]
        else:
            product["images"] = []

    if not product.get("image") and product["images"]:
        product["image"] = product["images"][0]

    return product


def serialize_products(
    products: List[dict],
) -> List[dict]:
    return [
        serialize_product(product)
        for product in products
    ]


# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
    )

    price: float = Field(
        ...,
        ge=0,
    )

    category: str = Field(
        ...,
        min_length=1,
    )

    image: Optional[str] = None

    images: Optional[
        List[str]
    ] = None

    shortDescription: Optional[str] = None

    description: Optional[str] = None

    specifications: Optional[
        Dict[str, Any]
    ] = None

    stock: int = Field(
        0,
        ge=0,
    )

    condition: Optional[str] = "New"

    is_featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(
        None,
        min_length=1,
    )

    price: Optional[float] = Field(
        None,
        ge=0,
    )

    category: Optional[str] = Field(
        None,
        min_length=1,
    )

    image: Optional[str] = None

    images: Optional[
        List[str]
    ] = None

    shortDescription: Optional[str] = None

    description: Optional[str] = None

    specifications: Optional[
        Dict[str, Any]
    ] = None

    stock: Optional[int] = Field(
        None,
        ge=0,
    )

    condition: Optional[str] = None

    is_featured: Optional[bool] = None


# ============================================================
# IMAGE HELPERS
# ============================================================

def normalize_images(
    image: Optional[str],
    images: Optional[List[str]],
) -> List[str]:
    normalized_images = []

    if isinstance(images, list):
        for current_image in images:
            if current_image is None:
                continue

            image_value = str(
                current_image
            ).strip()

            if image_value and image_value not in normalized_images:
                normalized_images.append(
                    image_value
                )

    primary_image = (
        str(image).strip()
        if image is not None
        else ""
    )

    if primary_image:
        normalized_images = [
            primary_image,
            *[
                current_image
                for current_image in normalized_images
                if current_image != primary_image
            ],
        ]

    return normalized_images


# ============================================================
# GET ALL PRODUCTS
# ============================================================

@router.get("/")
def get_products(
    page: int = 1,
    limit: int = 5000,
):
    try:
        if page < 1:
            page = 1

        if limit < 1:
            limit = 5000

        if limit > 5000:
            limit = 5000

        skip = (page - 1) * limit

        products = list(
            products_collection
            .find()
            .sort(
                "createdAt",
                -1,
            )
            .skip(skip)
            .limit(limit)
        )

        total = products_collection.count_documents(
            {}
        )

        return {
            "success": True,
            "products": serialize_products(
                products
            ),
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (
                    (total + limit - 1) // limit
                    if limit > 0
                    else 0
                ),
            },
        }

    except PyMongoError as error:
        print(
            f"Error fetching products: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch products.",
        )


# ============================================================
# FEATURED PRODUCTS
# IMPORTANT:
# This route MUST come before /{product_id}
# ============================================================

@router.get("/featured")
def get_featured_products(
    limit: int = 8,
):
    try:
        if limit < 1:
            limit = 8

        if limit > 50:
            limit = 50

        products = list(
            products_collection
            .find(
                {
                    "is_featured": True
                }
            )
            .sort(
                "createdAt",
                -1,
            )
            .limit(limit)
        )

        return {
            "success": True,
            "products": serialize_products(
                products
            ),
        }

    except PyMongoError as error:
        print(
            f"Error fetching featured products: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch featured products.",
        )


# ============================================================
# SEARCH PRODUCTS
# ============================================================

@router.get("/search/")
def search_products(
    q: str = "",
    category: Optional[str] = None,
):
    try:
        search_filter = {}

        if q.strip():
            search_filter["$or"] = [
                {
                    "name": {
                        "$regex": q.strip(),
                        "$options": "i",
                    }
                },
                {
                    "shortDescription": {
                        "$regex": q.strip(),
                        "$options": "i",
                    }
                },
                {
                    "description": {
                        "$regex": q.strip(),
                        "$options": "i",
                    }
                },
            ]

        if category and category.strip():
            search_filter["category"] = {
                "$regex": category.strip(),
                "$options": "i",
            }

        products = list(
            products_collection
            .find(search_filter)
            .sort(
                "createdAt",
                -1,
            )
        )

        return {
            "success": True,
            "products": serialize_products(
                products
            ),
        }

    except PyMongoError as error:
        print(
            f"Error searching products: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to search products.",
        )


# ============================================================
# GET SINGLE PRODUCT
# IMPORTANT:
# This dynamic route comes AFTER /featured and /search/
# ============================================================

@router.get("/{product_id}")
def get_product(
    product_id: str,
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID.",
        )

    try:
        product = products_collection.find_one(
            {
                "_id": ObjectId(product_id)
            }
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        return {
            "success": True,
            "product": serialize_product(
                product
            ),
        }

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error fetching product: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch product.",
        )


# ============================================================
# CREATE PRODUCT
# ADMIN + CO ADMIN
# ============================================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product: ProductCreate,
    current_admin=Depends(
        get_current_product_order_admin
    ),
):
    try:
        product_data = product.model_dump()

        if product_data.get(
            "specifications"
        ) is None:
            product_data["specifications"] = {}

        product_data["is_featured"] = bool(
            product_data.get(
                "is_featured",
                False,
            )
        )

        product_data["images"] = normalize_images(
            product_data.get("image"),
            product_data.get("images"),
        )

        if product_data["images"]:
            product_data["image"] = (
                product_data["images"][0]
            )
        else:
            product_data["image"] = None

        now = datetime.now(
            timezone.utc
        )

        product_data["createdAt"] = now
        product_data["updatedAt"] = now

        result = products_collection.insert_one(
            product_data
        )

        created_product = (
            products_collection.find_one(
                {
                    "_id": result.inserted_id
                }
            )
        )

        return {
            "success": True,
            "message": "Product created successfully.",
            "product": serialize_product(
                created_product
            ),
        }

    except PyMongoError as error:
        print(
            f"Error creating product: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create product.",
        )


# ============================================================
# UPDATE PRODUCT
# ADMIN + CO ADMIN
# ============================================================

@router.put("/{product_id}")
def update_product(
    product_id: str,
    product: ProductUpdate,
    current_admin=Depends(
        get_current_product_order_admin
    ),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID.",
        )

    try:
        update_data = product.model_dump(
            exclude_unset=True
        )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields provided for update.",
            )

        if "is_featured" in update_data:
            update_data["is_featured"] = bool(
                update_data["is_featured"]
            )

        if (
            "images" in update_data
            or "image" in update_data
        ):
            existing_product = (
                products_collection.find_one(
                    {
                        "_id": ObjectId(
                            product_id
                        )
                    }
                )
            )

            if not existing_product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product not found.",
                )

            current_primary_image = (
                update_data.get(
                    "image",
                    existing_product.get(
                        "image"
                    ),
                )
            )

            current_images = update_data.get(
                "images",
                existing_product.get(
                    "images"
                ),
            )

            normalized_images = normalize_images(
                current_primary_image,
                current_images,
            )

            update_data["images"] = (
                normalized_images
            )

            update_data["image"] = (
                normalized_images[0]
                if normalized_images
                else None
            )

        update_data["updatedAt"] = (
            datetime.now(
                timezone.utc
            )
        )

        result = products_collection.update_one(
            {
                "_id": ObjectId(product_id)
            },
            {
                "$set": update_data
            },
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        updated_product = (
            products_collection.find_one(
                {
                    "_id": ObjectId(product_id)
                }
            )
        )

        return {
            "success": True,
            "message": "Product updated successfully.",
            "product": serialize_product(
                updated_product
            ),
        }

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error updating product: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update product.",
        )


# ============================================================
# DELETE PRODUCT
# ADMIN + CO ADMIN
# ============================================================

@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    current_admin=Depends(
        get_current_product_order_admin
    ),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID.",
        )

    try:
        result = products_collection.delete_one(
            {
                "_id": ObjectId(product_id)
            }
        )

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        return {
            "success": True,
            "message": "Product deleted successfully.",
        }

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error deleting product: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete product.",
        )


# ============================================================
# UPDATE PRODUCT STOCK
# ADMIN + CO ADMIN
# ============================================================

@router.patch("/{product_id}/stock")
def update_product_stock(
    product_id: str,
    stock: int,
    current_admin=Depends(
        get_current_product_order_admin
    ),
):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID.",
        )

    if stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock cannot be negative.",
        )

    try:
        result = products_collection.update_one(
            {
                "_id": ObjectId(product_id)
            },
            {
                "$set": {
                    "stock": stock,
                    "updatedAt": datetime.now(
                        timezone.utc
                    ),
                }
            },
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        updated_product = (
            products_collection.find_one(
                {
                    "_id": ObjectId(product_id)
                }
            )
        )

        return {
            "success": True,
            "message": "Product stock updated successfully.",
            "product": serialize_product(
                updated_product
            ),
        }

    except HTTPException:
        raise

    except PyMongoError as error:
        print(
            f"Error updating product stock: {error}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update product stock.",
        )