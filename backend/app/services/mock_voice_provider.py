from typing import Dict, Any

from backend.app.services.voice_provider import VoiceProvider


class MockVoiceProvider(VoiceProvider):

    def initiate_call(
        self,
        to_number: str,
        from_number: str,
        agent_id: int,
    ) -> Dict[str, Any]:

        provider_call_id = (
            f"mock_agent_{agent_id}_"
            f"{to_number[-4:]}"
        )

        return {
            "provider_call_id": provider_call_id,
            "status": "initiated",
            "to_number": to_number,
            "from_number": from_number,
            "agent_id": agent_id,
        }

    def end_call(
        self,
        provider_call_id: str,
    ) -> Dict[str, Any]:

        return {
            "provider_call_id": provider_call_id,
            "status": "completed",
        }