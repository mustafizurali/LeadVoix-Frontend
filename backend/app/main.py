from fastapi import FastAPI
from backend.app.api.auth import router as auth_router
from backend.app.api.organization import router as organization_router
from backend.app.api.contact import router as contact_router
from backend.app.api.lead import router as lead_router
from backend.app.api.company import router as company_router
from backend.app.api.pipeline import router as pipeline_router
from backend.app.api.deal import router as deal_router
from backend.app.api.task import router as task_router
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.dashboard import router as dashboard_router


app = FastAPI(title="LeadVoix OS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(task_router)
app.include_router(pipeline_router)
app.include_router(organization_router)
app.include_router(contact_router)
app.include_router(lead_router)
app.include_router(company_router)
app.include_router(deal_router)
app.include_router(dashboard_router)

@app.get("/")
def root():
    return {"message": "LeadVoix OS API is running"}