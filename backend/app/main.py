from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.auth import router as auth_router
from backend.app.api.organization import router as organization_router
from backend.app.api.contact import router as contact_router
from backend.app.api.lead import router as lead_router
from backend.app.api.company import router as company_router
from backend.app.api.pipeline import router as pipeline_router
from backend.app.api.deal import router as deal_router
from backend.app.api.task import router as task_router
from backend.app.api.dashboard import router as dashboard_router

from backend.app.api import agent
from backend.app.api import agent_knowledge
from backend.app.api import agent_call
from backend.app.api import agent_call_transcript
from backend.app.api import agent_call_summary
from backend.app.api import agent_call_analysis
from backend.app.api import agent_call_intelligence
from backend.app.api import follow_up_task
from backend.app.api import demo_request


app = FastAPI(title="LeadVoix OS API")


# CORS
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


# Core API routers
app.include_router(auth_router)
app.include_router(task_router)
app.include_router(pipeline_router)
app.include_router(organization_router)
app.include_router(contact_router)
app.include_router(lead_router)
app.include_router(company_router)
app.include_router(deal_router)
app.include_router(dashboard_router)


# AI Voice Agent routers
app.include_router(agent.router)
app.include_router(agent_knowledge.router)
app.include_router(agent_call.router)
app.include_router(agent_call_transcript.router)
app.include_router(agent_call_summary.router)
app.include_router(agent_call_analysis.router)
app.include_router(agent_call_intelligence.router)
app.include_router(follow_up_task.router)


# Demo Request
app.include_router(demo_request.router)


@app.get("/")
def root():
    return {"message": "LeadVoix OS API is running"}