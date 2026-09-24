from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_admin
from database import blogs_collection
from schemas import BlogCreate, BlogResponse, BlogUpdate


router = APIRouter(
    prefix="/api/blogs",
    tags=["Blogs"],
)


def serialize_blog(blog):
    return {
        "id": str(blog["_id"]),
        "title": blog.get("title", ""),
        "slug": blog.get("slug", ""),
        "excerpt": blog.get("excerpt", ""),
        "content": blog.get("content", ""),
        "author": blog.get("author", ""),
        "image": blog.get("image"),
        "category": blog.get("category", "Technology"),
        "tags": blog.get("tags", []),
        "is_published": blog.get(
            "is_published",
            False,
        ),
        "published_at": (
            blog["published_at"].isoformat()
            if isinstance(
                blog.get("published_at"),
                datetime,
            )
            else blog.get("published_at")
        ),
        "created_at": (
            blog["created_at"].isoformat()
            if isinstance(
                blog.get("created_at"),
                datetime,
            )
            else blog.get("created_at")
        ),
        "updated_at": (
            blog["updated_at"].isoformat()
            if isinstance(
                blog.get("updated_at"),
                datetime,
            )
            else blog.get("updated_at")
        ),
    }


def clean_tags(tags):
    if not isinstance(tags, list):
        return []

    cleaned = []

    for tag in tags:
        value = str(tag).strip()

        if value and value not in cleaned:
            cleaned.append(value)

    return cleaned


def clean_slug(value):
    slug = str(value or "").strip().lower()

    slug = slug.replace(" ", "-")

    allowed = []

    for character in slug:
        if (
            character.isalnum()
            or character in "-_"
        ):
            allowed.append(character)

    cleaned = "".join(allowed)

    while "--" in cleaned:
        cleaned = cleaned.replace(
            "--",
            "-",
        )

    return cleaned.strip("-")


# =========================================================
# PUBLIC BLOGS
# =========================================================

@router.get(
    "/public",
)
def get_public_blogs():
    blogs = list(
        blogs_collection.find(
            {
                "is_published": True,
            }
        ).sort(
            [
                (
                    "published_at",
                    -1,
                ),
                (
                    "created_at",
                    -1,
                ),
            ]
        )
    )

    return {
        "success": True,
        "blogs": [
            serialize_blog(blog)
            for blog in blogs
        ],
    }


@router.get(
    "/public/{blog_id}",
)
def get_public_blog(
    blog_id: str,
):
    try:
        object_id = ObjectId(blog_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID.",
        )

    blog = blogs_collection.find_one(
        {
            "_id": object_id,
            "is_published": True,
        }
    )

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Published blog not found.",
        )

    return {
        "success": True,
        "blog": serialize_blog(blog),
    }


# =========================================================
# ADMIN BLOGS
# =========================================================

@router.get(
    "/admin",
)
def get_admin_blogs(
    current_admin=Depends(get_current_admin),
):
    blogs = list(
        blogs_collection.find().sort(
            [
                (
                    "created_at",
                    -1,
                ),
            ]
        )
    )

    return {
        "success": True,
        "blogs": [
            serialize_blog(blog)
            for blog in blogs
        ],
    }


@router.get(
    "/admin/{blog_id}",
)
def get_admin_blog(
    blog_id: str,
    current_admin=Depends(get_current_admin),
):
    try:
        object_id = ObjectId(blog_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID.",
        )

    blog = blogs_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        )

    return {
        "success": True,
        "blog": serialize_blog(blog),
    }


# =========================================================
# CREATE BLOG
# =========================================================

@router.post(
    "/admin",
    status_code=status.HTTP_201_CREATED,
)
def create_blog(
    blog_data: BlogCreate,
    current_admin=Depends(get_current_admin),
):
    title = blog_data.title.strip()

    slug = clean_slug(
        blog_data.slug
    )

    excerpt = blog_data.excerpt.strip()

    content = blog_data.content.strip()

    author = blog_data.author.strip()

    image = (
        blog_data.image.strip()
        if isinstance(
            blog_data.image,
            str,
        )
        else None
    )

    category = blog_data.category.strip()

    tags = clean_tags(
        blog_data.tags
    )

    is_published = blog_data.is_published

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog title is required.",
        )

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blog content is required.",
        )

    if not slug:
        slug = clean_slug(title)

    if not slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid blog slug is required.",
        )

    existing_slug = blogs_collection.find_one(
        {
            "slug": slug,
        }
    )

    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A blog with this slug already exists.",
        )

    now = datetime.now(timezone.utc)

    blog_document = {
        "title": title,
        "slug": slug,
        "excerpt": excerpt,
        "content": content,
        "author": author,
        "image": image,
        "category": category,
        "tags": tags,
        "is_published": is_published,
        "published_at": (
            now
            if is_published
            else None
        ),
        "created_at": now,
        "updated_at": now,
    }

    result = blogs_collection.insert_one(
        blog_document
    )

    created_blog = blogs_collection.find_one(
        {
            "_id": result.inserted_id,
        }
    )

    if not created_blog:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Blog was created but could not be retrieved.",
        )

    return {
        "success": True,
        "message": "Blog created successfully.",
        "blog": serialize_blog(
            created_blog
        ),
    }


# =========================================================
# UPDATE BLOG
# =========================================================

@router.put(
    "/admin/{blog_id}",
)
def update_blog(
    blog_id: str,
    blog_data: BlogUpdate,
    current_admin=Depends(get_current_admin),
):
    try:
        object_id = ObjectId(blog_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID.",
        )

    existing_blog = blogs_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        )

    updated_fields = {}

    if "title" in blog_data.model_fields_set:
        title = (
            blog_data.title.strip()
            if blog_data.title
            else ""
        )

        if not title:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blog title is required.",
            )

        updated_fields["title"] = title

    else:
        title = existing_blog.get(
            "title",
            "",
        )

    if "slug" in blog_data.model_fields_set:
        slug = clean_slug(
            blog_data.slug
        )
    else:
        slug = existing_blog.get(
            "slug",
            "",
        )

    if not slug:
        slug = clean_slug(title)

    if not slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid blog slug is required.",
        )

    duplicate_slug = blogs_collection.find_one(
        {
            "slug": slug,
            "_id": {
                "$ne": object_id,
            },
        }
    )

    if duplicate_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A blog with this slug already exists.",
        )

    updated_fields["slug"] = slug

    if "excerpt" in blog_data.model_fields_set:
        updated_fields["excerpt"] = (
            blog_data.excerpt.strip()
            if blog_data.excerpt
            else ""
        )

    if "content" in blog_data.model_fields_set:
        content = (
            blog_data.content.strip()
            if blog_data.content
            else ""
        )

        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Blog content is required.",
            )

        updated_fields["content"] = content

    if "author" in blog_data.model_fields_set:
        updated_fields["author"] = (
            blog_data.author.strip()
            if blog_data.author
            else ""
        )

    if "image" in blog_data.model_fields_set:
        updated_fields["image"] = (
            blog_data.image.strip()
            if isinstance(
                blog_data.image,
                str,
            )
            else None
        )

    if "category" in blog_data.model_fields_set:
        updated_fields["category"] = (
            blog_data.category.strip()
            if blog_data.category
            else "Technology"
        )

    if "tags" in blog_data.model_fields_set:
        updated_fields["tags"] = clean_tags(
            blog_data.tags
        )

    old_is_published = existing_blog.get(
        "is_published",
        False,
    )

    if "is_published" in blog_data.model_fields_set:
        is_published = blog_data.is_published
    else:
        is_published = old_is_published

    published_at = existing_blog.get(
        "published_at"
    )

    if is_published and not old_is_published:
        published_at = datetime.now(
            timezone.utc
        )

    if not is_published:
        published_at = None

    updated_fields["is_published"] = (
        is_published
    )

    updated_fields["published_at"] = (
        published_at
    )

    updated_fields["updated_at"] = (
        datetime.now(timezone.utc)
    )

    blogs_collection.update_one(
        {
            "_id": object_id,
        },
        {
            "$set": updated_fields,
        },
    )

    updated_blog = blogs_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not updated_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found after update.",
        )

    return {
        "success": True,
        "message": "Blog updated successfully.",
        "blog": serialize_blog(
            updated_blog
        ),
    }


# =========================================================
# DELETE BLOG
# =========================================================

@router.delete(
    "/admin/{blog_id}",
)
def delete_blog(
    blog_id: str,
    current_admin=Depends(get_current_admin),
):
    try:
        object_id = ObjectId(blog_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid blog ID.",
        )

    existing_blog = blogs_collection.find_one(
        {
            "_id": object_id,
        }
    )

    if not existing_blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog not found.",
        )

    blogs_collection.delete_one(
        {
            "_id": object_id,
        }
    )

    return {
        "success": True,
        "message": "Blog deleted successfully.",
        "blog_id": blog_id,
    }