from pydantic import BaseModel, ConfigDict


class AgentCallTranscriptCreate(BaseModel):
    speaker: str
    message: str


class AgentCallTranscriptUpdate(BaseModel):
    speaker: str | None = None
    message: str | None = None


class AgentCallTranscriptResponse(BaseModel):
    id: int
    agent_call_id: int
    speaker: str
    message: str

    model_config = ConfigDict(
        from_attributes=True,
    )