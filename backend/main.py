from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router
from products import router as products_router
from hero import router as hero_router
from whatsapp import router as whatsapp_router
from theme import router as theme_router
from reviews import router as reviews_router
from header_footer import router as header_footer_router

from config import APP_NAME, FRONTEND_URL, PORT
from database import test_database_connection


app = FastAPI(
    title=APP_NAME,
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

allowed_origins = list(
    dict.fromkeys(
        [
            FRONTEND_URL.rstrip("/"),
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

# Authentication
app.include_router(auth_router)

# Products
app.include_router(products_router)

# Hero
app.include_router(hero_router)

# WhatsApp
app.include_router(whatsapp_router)

# Theme
app.include_router(theme_router)

# Customer Reviews / Video Testimonials
app.include_router(reviews_router)

# Header & Footer
app.include_router(header_footer_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "GoJuniors Laptop Store API is running.",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    database_connected = test_database_connection()

    return {
        "success": True,
        "backend": "running",
        "database": (
            "connected"
            if database_connected
            else "disconnected"
        ),
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=PORT,
        reload=True,
    )