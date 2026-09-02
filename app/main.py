import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import chemicals, health, root, transactions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("chemical_inventory")

app = FastAPI(title="Chemical Inventory API")

# Allow the local Vite dev servers (frontend/, frontend_new/) to call this API
# regardless of which port they happen to be running on.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root.router)
app.include_router(health.router)
app.include_router(chemicals.router)
app.include_router(transactions.router)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Invalid request", "details": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error while processing request: %s", request.url)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
