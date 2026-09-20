from pymongo import MongoClient
from pymongo.errors import PyMongoError

from config import MONGO_URI, MONGO_DB_NAME


# MongoDB client
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
)


# Database
db = client[MONGO_DB_NAME]


def test_database_connection():
    """
    Test whether MongoDB is reachable.
    """
    try:
        client.admin.command("ping")
        return True
    except PyMongoError as error:
        print(f"MongoDB connection failed: {error}")
        return False


# Collections
users_collection = db["users"]
products_collection = db["products"]
orders_collection = db["orders"]
categories_collection = db["categories"]
theme_settings_collection = db["theme_settings"]