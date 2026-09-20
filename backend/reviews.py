from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
import shutil

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from auth import get_current_admin
from database import users_collection


# ============================================================
# CUSTOMER REVIEWS / VIDEO TESTIMONIALS
# ============================================================

router = APIRouter(
    prefix="/api/reviews",
    tags=["Customer Reviews"],
)


# ============================================================
# DATABASE COLLECTION
#
# We reuse the existing MongoDB database connection through
# the already available users_collection.
# ============================================================

reviews_collection = (
    users_collection.database["customer_reviews"]
)


# ============================================================
# VIDEO UPLOAD SETTINGS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = (
    BASE_DIR
    / "uploads"
    / "customer_reviews"
)

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


ALLOWED_VIDEO_TYPES = {
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
}


MAX_VIDEO_SIZE = 100 * 1024 * 1024


# ============================================================
# HELPERS
# ============================================================

def serialize_review(
    review,
    request: Request,
):
    """
    Convert MongoDB review document into a JSON-safe object.
    """

    review_id = str(review["_id"])

    created_at = review.get(
        "created_at"
    )

    updated_at = review.get(
        "updated_at"
    )

    if isinstance(created_at, datetime):
        created_at_value = (
            created_at.isoformat()
        )
    else:
        created_at_value = (
            str(created_at)
            if created_at
            else None
        )

    if isinstance(updated_at, datetime):
        updated_at_value = (
            updated_at.isoformat()
        )
    else:
        updated_at_value = (
            str(updated_at)
            if updated_at
            else None
        )

    base_url = str(
        request.base_url
    ).rstrip("/")

    return {
        "id": review_id,

        "customer_name": review.get(
            "customer_name",
            "",
        ),

        "review_text": review.get(
            "review_text",
            "",
        ),

        "rating": int(
            review.get(
                "rating",
                5,
            )
        ),

        "is_active": bool(
            review.get(
                "is_active",
                True,
            )
        ),

        "video_url": (
            f"{base_url}"
            f"/api/reviews/{review_id}/video"
        ),

        "created_at": created_at_value,

        "updated_at": updated_at_value,
    }


def validate_review_data(
    customer_name: str,
    review_text: str,
    rating: int,
):
    """
    Validate customer review information.
    """

    cleaned_name = (
        customer_name.strip()
    )

    cleaned_text = (
        review_text.strip()
    )

    if not cleaned_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer name is required.",
        )

    if not cleaned_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review text is required.",
        )

    if len(cleaned_name) > 120:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer name is too long.",
        )

    if len(cleaned_text) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review text is too long.",
        )

    if rating < 1 or rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5.",
        )

    return (
        cleaned_name,
        cleaned_text,
        rating,
    )


async def save_video_file(
    video: UploadFile,
):
    """
    Save uploaded video safely to the dedicated
    customer reviews upload directory.
    """

    if not video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer review video is required.",
        )

    content_type = (
        video.content_type
        or ""
    ).lower()

    if content_type not in ALLOWED_VIDEO_TYPES:
        allowed_types = ", ".join(
            ALLOWED_VIDEO_TYPES.keys()
        )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid video format. "
                f"Allowed formats: {allowed_types}."
            ),
        )

    extension = (
        ALLOWED_VIDEO_TYPES[
            content_type
        ]
    )

    unique_name = (
        f"{uuid4().hex}"
        f"{extension}"
    )

    destination = (
        UPLOAD_DIR
        / unique_name
    )

    total_size = 0

    try:
        with destination.open(
            "wb"
        ) as output_file:

            while True:
                chunk = await video.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total_size += len(
                    chunk
                )

                if (
                    total_size
                    > MAX_VIDEO_SIZE
                ):
                    output_file.close()

                    try:
                        destination.unlink()
                    except FileNotFoundError:
                        pass

                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=(
                            "Video is too large. "
                            "Maximum allowed size is 100 MB."
                        ),
                    )

                output_file.write(
                    chunk
                )

    finally:
        await video.close()

    if total_size == 0:
        try:
            destination.unlink()
        except FileNotFoundError:
            pass

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded video is empty.",
        )

    return unique_name


def delete_video_file(
    filename: str | None,
):
    """
    Safely delete a stored review video.
    """

    if not filename:
        return

    safe_filename = Path(
        filename
    ).name

    file_path = (
        UPLOAD_DIR
        / safe_filename
    )

    try:
        if file_path.exists():
            file_path.unlink()
    except OSError:
        pass


def get_object_id(
    review_id: str,
):
    """
    Convert string ID to MongoDB ObjectId.
    """

    try:
        from bson import ObjectId

        return ObjectId(
            review_id
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID.",
        )


# ============================================================
# PUBLIC - GET ACTIVE CUSTOMER REVIEWS
# ============================================================

@router.get("")
def get_public_reviews(
    request: Request,
):
    """
    Return only active customer reviews.

    This endpoint is public because customers only need
    to view the published reviews.
    """

    reviews = (
        reviews_collection
        .find(
            {
                "is_active": True,
            }
        )
        .sort(
            "created_at",
            -1,
        )
    )

    response_reviews = [
        serialize_review(
            review,
            request,
        )
        for review in reviews
    ]

    return {
        "success": True,
        "reviews": response_reviews,
    }


# ============================================================
# PUBLIC - STREAM REVIEW VIDEO
# ============================================================

@router.get(
    "/{review_id}/video"
)
def get_review_video(
    review_id: str,
):
    """
    Stream a customer review video.

    The review must exist. Active/inactive visibility is
    checked so inactive reviews cannot be publicly viewed.
    """

    object_id = get_object_id(
        review_id
    )

    review = (
        reviews_collection.find_one(
            {
                "_id": object_id,
                "is_active": True,
            }
        )
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer review video not found.",
        )

    filename = review.get(
        "video_filename"
    )

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review video file not found.",
        )

    safe_filename = Path(
        filename
    ).name

    video_path = (
        UPLOAD_DIR
        / safe_filename
    )

    if not video_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review video file is missing.",
        )

    media_type = (
        review.get(
            "video_content_type"
        )
        or "video/mp4"
    )

    return FileResponse(
        path=str(video_path),
        media_type=media_type,
        filename=safe_filename,
    )


# ============================================================
# ADMIN - GET ALL REVIEWS
# ============================================================

@router.get("/admin")
def get_admin_reviews(
    request: Request,
    current_admin=Depends(
        get_current_admin
    ),
):
    """
    Return all customer reviews for the admin panel.

    Admin only.
    """

    reviews = (
        reviews_collection
        .find({})
        .sort(
            "created_at",
            -1,
        )
    )

    response_reviews = [
        serialize_review(
            review,
            request,
        )
        for review in reviews
    ]

    return {
        "success": True,
        "reviews": response_reviews,
    }


# ============================================================
# ADMIN - CREATE REVIEW + UPLOAD VIDEO
# ============================================================

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    request: Request,
    customer_name: str = Form(...),
    review_text: str = Form(...),
    rating: int = Form(5),
    is_active: bool = Form(True),
    video: UploadFile = File(...),
    current_admin=Depends(
        get_current_admin
    ),
):
    """
    Create a new customer review and upload its video.

    Admin only.
    """

    (
        cleaned_name,
        cleaned_text,
        cleaned_rating,
    ) = validate_review_data(
        customer_name,
        review_text,
        rating,
    )

    video_filename = None

    try:
        video_filename = (
            await save_video_file(
                video
            )
        )

        now = datetime.now(
            timezone.utc
        )

        review_document = {
            "customer_name": cleaned_name,

            "review_text": cleaned_text,

            "rating": cleaned_rating,

            "is_active": bool(
                is_active
            ),

            "video_filename": (
                video_filename
            ),

            "video_content_type": (
                video.content_type
                or "video/mp4"
            ),

            "created_at": now,

            "updated_at": now,
        }

        result = (
            reviews_collection
            .insert_one(
                review_document
            )
        )

        created_review = (
            reviews_collection
            .find_one(
                {
                    "_id":
                        result.inserted_id
                }
            )
        )

        if not created_review:
            delete_video_file(
                video_filename
            )

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Review was not created."
                ),
            )

        return {
            "success": True,
            "message": (
                "Customer review "
                "uploaded successfully."
            ),
            "review": serialize_review(
                created_review,
                request,
            ),
        }

    except HTTPException:
        raise

    except Exception as error:
        if video_filename:
            delete_video_file(
                video_filename
            )

        print(
            "Customer review creation error:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to create customer review."
            ),
        )


# ============================================================
# ADMIN - UPDATE REVIEW
# ============================================================

@router.put(
    "/{review_id}"
)
async def update_review(
    review_id: str,
    request: Request,
    customer_name: str = Form(...),
    review_text: str = Form(...),
    rating: int = Form(5),
    is_active: bool = Form(True),
    video: UploadFile | None = File(None),
    current_admin=Depends(
        get_current_admin
    ),
):
    """
    Update review information.

    A new video can optionally replace the existing video.

    Admin only.
    """

    object_id = get_object_id(
        review_id
    )

    existing_review = (
        reviews_collection.find_one(
            {
                "_id": object_id,
            }
        )
    )

    if not existing_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer review not found.",
        )

    (
        cleaned_name,
        cleaned_text,
        cleaned_rating,
    ) = validate_review_data(
        customer_name,
        review_text,
        rating,
    )

    old_video_filename = (
        existing_review.get(
            "video_filename"
        )
    )

    new_video_filename = None

    try:
        update_document = {
            "customer_name": cleaned_name,

            "review_text": cleaned_text,

            "rating": cleaned_rating,

            "is_active": bool(
                is_active
            ),

            "updated_at":
                datetime.now(
                    timezone.utc
                ),
        }

        if video is not None:
            new_video_filename = (
                await save_video_file(
                    video
                )
            )

            update_document[
                "video_filename"
            ] = new_video_filename

            update_document[
                "video_content_type"
            ] = (
                video.content_type
                or "video/mp4"
            )

        reviews_collection.update_one(
            {
                "_id": object_id,
            },
            {
                "$set":
                    update_document
            },
        )

        updated_review = (
            reviews_collection.find_one(
                {
                    "_id": object_id,
                }
            )
        )

        if not updated_review:
            if new_video_filename:
                delete_video_file(
                    new_video_filename
                )

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Review was not found after update."
                ),
            )

        if (
            new_video_filename
            and old_video_filename
            and (
                new_video_filename
                != old_video_filename
            )
        ):
            delete_video_file(
                old_video_filename
            )

        return {
            "success": True,
            "message": (
                "Customer review "
                "updated successfully."
            ),
            "review": serialize_review(
                updated_review,
                request,
            ),
        }

    except HTTPException:
        raise

    except Exception as error:
        if new_video_filename:
            delete_video_file(
                new_video_filename
            )

        print(
            "Customer review update error:",
            error,
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Unable to update customer review."
            ),
        )


# ============================================================
# ADMIN - DELETE REVIEW
# ============================================================

@router.delete(
    "/{review_id}"
)
def delete_review(
    review_id: str,
    current_admin=Depends(
        get_current_admin
    ),
):
    """
    Delete customer review and its video file.

    Admin only.
    """

    object_id = get_object_id(
        review_id
    )

    existing_review = (
        reviews_collection.find_one(
            {
                "_id": object_id,
            }
        )
    )

    if not existing_review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer review not found.",
        )

    video_filename = (
        existing_review.get(
            "video_filename"
        )
    )

    result = (
        reviews_collection.delete_one(
            {
                "_id": object_id,
            }
        )
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Customer review could not be deleted."
            ),
        )

    delete_video_file(
        video_filename
    )

    return {
        "success": True,
        "message": (
            "Customer review "
            "deleted successfully."
        ),
    }