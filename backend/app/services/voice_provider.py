from abc import ABC, abstractmethod
from typing import Dict, Any


class VoiceProvider(ABC):

    @abstractmethod
    def initiate_call(
        self,
        to_number: str,
        from_number: str,
        agent_id: int,
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def end_call(
        self,
        provider_call_id: str,
    ) -> Dict[str, Any]:
        pass