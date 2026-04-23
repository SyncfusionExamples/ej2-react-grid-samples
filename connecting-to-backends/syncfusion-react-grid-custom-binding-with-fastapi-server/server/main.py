from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products

app = FastAPI(title="Products API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(
    products.router,
    prefix="/products",
    tags=["products"]
)
