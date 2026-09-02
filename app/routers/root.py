from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def home():
    return {"message": "Chemical Inventory API is running!"}
