from datetime import datetime


def initiate_voice_call(
    agent_id: int,
    phone_number: str,
):
    return {
        "status": "in_progress",
        "provider_call_id": (
            f"mock_agent_{agent_id}_"
            f"{int(datetime.now().timestamp())}"
        ),
    }


def end_voice_call(
    provider_call_id: str,
):
    return {
        "status": "completed",
        "provider_call_id": provider_call_id,
    }


def get_voice_call_status(
    provider_call_id: str,
):
    return {
        "status": "in_progress",
        "provider_call_id": provider_call_id,
    }