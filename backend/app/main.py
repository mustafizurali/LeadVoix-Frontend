from fastapi import FastAPI
from backend.app.api.auth import router as auth_router
from backend.app.api.organization import router as organization_router
from backend.app.api.contact import router as contact_router
from backend.app.api.lead import router as lead_router
from backend.app.api.company import router as company_router
from backend.app.api.pipeline import router as pipeline_router
from backend.app.api.deal import router as deal_router


app = FastAPI(title="LeadVoix OS API")

app.include_router(auth_router)
app.include_router(pipeline_router)
app.include_router(organization_router)
app.include_router(contact_router)
app.include_router(lead_router)
app.include_router(company_router)
app.include_router(deal_router)

@app.get("/")
def root():
    return {"message": "LeadVoix OS API is running"}