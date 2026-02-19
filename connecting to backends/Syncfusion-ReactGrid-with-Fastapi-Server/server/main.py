from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import from routers folder
from routers.products import router as products_router

app = FastAPI(title="Products API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register router
app.include_router(
    products_router,
    prefix="/products",
    tags=["products"]
)