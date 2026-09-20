from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
from pymongo.errors import PyMongoError

from database import products_collection


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


def serialize_product(product: dict) -> dict:
    if not product:
        return product

    product = dict(product)

    if "_id" in product:
        product["id"] = str(product.pop("_id"))

    return product


def serialize_products(products: List[dict]) -> List[dict]:
    return [
        serialize_product(product)
        for product in products
    ]


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    category: str = Field(..., min_length=1)
    image: Optional[str] = None
    shortDescription: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    stock: int = Field(0, ge=0)
    condition: Optional[str] = "New"


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, ge=0)
    category: Optional[str] = Field(None, min_length=1)
    image: Optional[str] = None
    shortDescription: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    stock: Optional[int] = Field(None, ge=0)
    condition: Optional[str] = None


@router.get("/")
def get_products():
    try:
        products = list(
            products_collection
            .find()
            .sort("createdAt", -1)
        )

        return {
            "success": True,
            "products": serialize_products(products),
        }

    except PyMongoError as error:
        print(f"Error fetching products: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch products.",
        )


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
            .sort("createdAt", -1)
        )

        return {
            "success": True,
            "products": serialize_products(products),
        }

    except PyMongoError as error:
        print(f"Error searching products: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to search products.",
        )


@router.get("/{product_id}")
def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID.",
        )

    try:
        product = products_collection.find_one(
            {"_id": ObjectId(product_id)}
        )

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        return {
            "success": True,
            "product": serialize_product(product),
        }

    except HTTPException:
        raise

    except PyMongoError as error:
        print(f"Error fetching product: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch product.",
        )


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_product(product: ProductCreate):
    try:
        product_data = product.model_dump()

        if product_data.get("specifications") is None:
            product_data["specifications"] = {}

        now = datetime.now(timezone.utc)

        product_data["createdAt"] = now
        product_data["updatedAt"] = now

        result = products_collection.insert_one(
            product_data
        )

        created_product = products_collection.find_one(
            {"_id": result.inserted_id}
        )

        return {
            "success": True,
            "message": "Product created successfully.",
            "product": serialize_product(
                created_product
            ),
        }

    except PyMongoError as error:
        print(f"Error creating product: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create product.",
        )


@router.put("/{product_id}")
def update_product(
    product_id: str,
    product: ProductUpdate,
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

        update_data["updatedAt"] = datetime.now(
            timezone.utc
        )

        result = products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data},
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

        updated_product = products_collection.find_one(
            {"_id": ObjectId(product_id)}
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
        print(f"Error updating product: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update product.",
        )


@router.delete("/{product_id}")
def delete_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID.",
        )

    try:
        result = products_collection.delete_one(
            {"_id": ObjectId(product_id)}
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
        print(f"Error deleting product: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete product.",
        )


@router.patch("/{product_id}/stock")
def update_product_stock(
    product_id: str,
    stock: int,
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
            {"_id": ObjectId(product_id)},
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

        updated_product = products_collection.find_one(
            {"_id": ObjectId(product_id)}
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
        print(f"Error updating product stock: {error}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update product stock.",
        )