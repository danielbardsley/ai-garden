from __future__ import annotations

import json
from typing import Any

from app.agent.schemas import AgentEventRequest, CaptureReflectionOutput, PhotoIdentificationOutput, PhotoIdentificationRequest, PlantChatOutput, PlantChatRequest, CareRecommendationOutput, CareRecommendationRequest, CareProfileDraftOutput, CareProfileDraftRequest, HomeTitleOutput, HomeTitleRequest
from app.config import Settings


class GardenAgent:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.provider_configured = bool(settings.openai_api_key)

    def run_event(self, event: AgentEventRequest) -> tuple[dict[str, Any], dict[str, int | None]]:
        return self.run_photo_categorization(event, image_bytes=None, mime_type=None)

    def run_photo_categorization(
        self,
        event: AgentEventRequest,
        *,
        image_bytes: bytes | None,
        mime_type: str | None,
    ) -> tuple[dict[str, Any], dict[str, int | None]]:
        self._require_provider()
        output = self._openai_capture_reflection(event, image_bytes=image_bytes, mime_type=mime_type)
        return output.model_dump(by_alias=True), {"prompt_tokens": None, "completion_tokens": None}



    def run_photo_identification(
        self,
        event: PhotoIdentificationRequest,
        *,
        image_bytes: bytes | None,
        mime_type: str | None,
    ) -> tuple[dict[str, Any], dict[str, int | None]]:
        self._require_provider()
        output = self._openai_photo_identification(event, image_bytes=image_bytes, mime_type=mime_type)
        return output.model_dump(by_alias=True), {"prompt_tokens": None, "completion_tokens": None}




    def run_plant_chat(self, request: PlantChatRequest) -> tuple[dict[str, Any], dict[str, int | None]]:
        self._require_provider()
        output = self._openai_plant_chat(request)
        return output.model_dump(by_alias=True), {"prompt_tokens": None, "completion_tokens": None}



    def run_care_recommendations(self, request: CareRecommendationRequest) -> tuple[dict[str, Any], dict[str, int | None]]:
        self._require_provider()
        output = self._openai_care_recommendations(request)
        return output.model_dump(by_alias=True), {"prompt_tokens": None, "completion_tokens": None}



    def run_care_profile_draft(self, request: CareProfileDraftRequest) -> tuple[dict[str, Any], dict[str, int | None]]:
        self._require_provider()
        output = self._openai_care_profile_draft(request)
        return output.model_dump(by_alias=True), {"prompt_tokens": None, "completion_tokens": None}



    def run_home_title(self, request: HomeTitleRequest) -> tuple[dict[str, Any], dict[str, int | None]]:
        self._require_provider()
        output = self._openai_home_title(request)
        return output.model_dump(by_alias=True), {"prompt_tokens": None, "completion_tokens": None}

    def _require_provider(self) -> None:
        if not self.provider_configured:
            raise RuntimeError("OpenAI API key is not configured")

    def _openai_capture_reflection(
        self,
        event: AgentEventRequest,
        *,
        image_bytes: bytes | None,
        mime_type: str | None,
    ) -> CaptureReflectionOutput:
        try:
            from agno.agent import Agent
            from agno.media import Image
            from agno.models.openai import OpenAIChat
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Agno OpenAI dependencies are unavailable") from exc

        agent = Agent(
            model=OpenAIChat(id=self.settings.garden_agent_model, api_key=self.settings.openai_api_key),
            instructions=[
                "You are Garden Roof Deck's concise behind-the-scenes garden photo categorization agent.",
                "Use the supplied photo image when present, plus JSON plant/observation context.",
                "Return structured output only: summary, tags, category, insight, optional care recommendation, confidence.",
                "Keep outputs short and cautious. Do not overwrite human facts or claim certainty beyond the image/context.",
            ],
        )
        prompt = (
            "Categorize this garden photo capture. Choose one category label from: "
            "growth_update, flowering, fruiting, harvest_ready, watering_check, pest_or_damage_watch, "
            "health_check, general_photo_log. Provide 3-6 concise visual tags, a short summary, "
            "and one useful insight for the plant timeline. Context JSON:\n"
            f"{json.dumps(event.context, ensure_ascii=False)}"
        )
        images = [Image(content=image_bytes, mime_type=mime_type or "image/jpeg", detail="high")] if image_bytes else None
        response = agent.run(prompt, images=images, output_schema=CaptureReflectionOutput)
        content = getattr(response, "content", response)
        if isinstance(content, CaptureReflectionOutput):
            return content
        if isinstance(content, dict):
            return CaptureReflectionOutput.model_validate(content)
        if isinstance(content, str):
            return CaptureReflectionOutput(
                summary=content,
                tags=[{"label": "garden journal", "confidence": 0.4}],
                insight={"title": "AI note", "body": content, "kind": "summary", "confidence": 0.4},
                confidence=0.4,
            )
        return CaptureReflectionOutput.model_validate(content)


    def _openai_photo_identification(
        self,
        event: PhotoIdentificationRequest,
        *,
        image_bytes: bytes | None,
        mime_type: str | None,
    ) -> PhotoIdentificationOutput:
        try:
            from agno.agent import Agent
            from agno.media import Image
            from agno.models.openai import OpenAIChat
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Agno OpenAI dependencies are unavailable") from exc

        plants = [plant.model_dump(by_alias=True) for plant in event.context.plants]
        agent = Agent(
            model=OpenAIChat(id=self.settings.garden_agent_model, api_key=self.settings.openai_api_key),
            instructions=[
                "You are Garden Roof Deck's pre-save plant identification and photo categorization agent.",
                "First identify the plant visually from the image on its own. Then compare that visual identification against the provided inventory.",
                "Use only provided plant ids in plantMatches. Never invent plant ids. If the visual identification is not in inventory, return no match or very low-confidence matches.",
                "If the image is not sufficient to identify a plant, return low confidence or no plantMatches.",
                "Return structured output only: visualCommonName, openIdentification, summary, plantMatches, tags, category, insight, optional careRecommendation, confidence.",
                "Keep outputs concise and cautious; do not claim disease certainty from one photo.",
            ],
        )
        prompt = (
            "Step 1: identify the plant in the image as accurately as possible, as if no inventory existed. Put a short 1-4 word plant name in visualCommonName, e.g. Snake plant or Jade plant. Put the fuller explanation in openIdentification. "
            "Step 2: compare that open visual identification to the supplied inventory and rank up to 3 plantMatches only if they are plausible. "
            "Do not force a match. If the best inventory match is weak, return no plantMatches or confidence below 0.55. Include short rationale and confidence. "
            "Also provide 3-6 visual tags, one category label, a short summary, and one useful insight. "
            "Category labels: growth_update, flowering, fruiting, harvest_ready, watering_check, pest_or_damage_watch, "
            "health_check, general_photo_log. Plant inventory JSON:\n"
            f"{json.dumps(plants, ensure_ascii=False)}\n"
            "Request context JSON:\n"
            f"{event.model_dump_json(by_alias=True)}"
        )
        images = [Image(content=image_bytes, mime_type=mime_type or "image/jpeg", detail="high")] if image_bytes else None
        response = agent.run(prompt, images=images, output_schema=PhotoIdentificationOutput)
        content = getattr(response, "content", response)
        if isinstance(content, PhotoIdentificationOutput):
            return content
        if isinstance(content, dict):
            return PhotoIdentificationOutput.model_validate(content)
        if isinstance(content, str):
            return PhotoIdentificationOutput(
                summary=content,
                tags=[{"label": "garden photo", "confidence": 0.4}],
                insight={"title": "AI note", "body": content, "kind": "summary", "confidence": 0.4},
                confidence=0.4,
            )
        return PhotoIdentificationOutput.model_validate(content)


    def _openai_plant_chat(self, request: PlantChatRequest) -> PlantChatOutput:
        try:
            from agno.agent import Agent
            from agno.models.openai import OpenAIChat
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Agno OpenAI dependencies are unavailable") from exc

        agent = Agent(
            model=OpenAIChat(id=self.settings.garden_agent_model, api_key=self.settings.openai_api_key),
            instructions=[
                "You are Garden Roof Deck's plant-specific garden assistant.",
                "Answer the user's question using the provided plant context plus general horticultural knowledge.",
                "Do not invent observations, dates, photos, or plant facts. If context is thin, say so.",
                "Prefer concise practical next steps. Be cautious with diagnoses and chemical/pesticide advice.",
                "Return structured output only: answer, summary, suggestedQuestions, confidence, sources.",
            ],
        )
        prompt = (
            "Answer this plant-specific question for Garden Roof Deck. Keep it concise and practical. "
            "Reference supplied context when useful, and suggest what to observe next.\n"
            f"Question: {request.question}\n"
            "Plant/context JSON:\n"
            f"{request.context.model_dump_json(by_alias=True)}"
        )
        response = agent.run(prompt, output_schema=PlantChatOutput)
        content = getattr(response, "content", response)
        if isinstance(content, PlantChatOutput):
            return content
        if isinstance(content, dict):
            return PlantChatOutput.model_validate(content)
        if isinstance(content, str):
            return PlantChatOutput(
                answer=content,
                summary=content[:180],
                suggestedQuestions=["What should I watch next?"],
                confidence=0.4,
            )
        return PlantChatOutput.model_validate(content)


    def _openai_care_recommendations(self, request: CareRecommendationRequest) -> CareRecommendationOutput:
        try:
            from agno.agent import Agent
            from agno.models.openai import OpenAIChat
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Agno OpenAI dependencies are unavailable") from exc

        agent = Agent(
            model=OpenAIChat(id=self.settings.garden_agent_model, api_key=self.settings.openai_api_key),
            instructions=[
                "You are Garden Roof Deck's cautious plant care recommendation agent.",
                "Use the supplied plant care context and general horticultural knowledge to suggest at most three care actions.",
                "Do not invent observations, dates, photos, or care history. If context is too thin, return no recommendations and explain what to observe next.",
                "Prefer observation/check actions when uncertain. Avoid disease certainty and avoid recommending restricted chemical treatments.",
                "Return structured output only: summary, recommendations, confidence.",
            ],
        )
        prompt = (
            "Suggest 0-3 practical next care recommendations for this plant. "
            "Each recommendation should be concise, user-actionable, and safe. dueOn is optional; use null unless the context supports a date.\n"
            "Care context JSON:\n"
            f"{request.context.model_dump_json(by_alias=True)}"
        )
        response = agent.run(prompt, output_schema=CareRecommendationOutput)
        content = getattr(response, "content", response)
        if isinstance(content, CareRecommendationOutput):
            return content
        if isinstance(content, dict):
            return CareRecommendationOutput.model_validate(content)
        if isinstance(content, str):
            return CareRecommendationOutput(summary=content, recommendations=[], confidence=0.35)
        return CareRecommendationOutput.model_validate(content)


    def _openai_care_profile_draft(self, request: CareProfileDraftRequest) -> CareProfileDraftOutput:
        try:
            from agno.agent import Agent
            from agno.models.openai import OpenAIChat
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Agno OpenAI dependencies are unavailable") from exc

        agent = Agent(
            model=OpenAIChat(id=self.settings.garden_agent_model, api_key=self.settings.openai_api_key),
            instructions=[
                "You are Garden Roof Deck's cautious care profile drafting agent.",
                "Draft concise plant care preference fields from supplied local context and general horticultural knowledge.",
                "Do not overwrite durable user preferences automatically; output a draft for review only.",
                "Leave unsupported fields null rather than inventing precision. Mention uncertainty in caveats or generalNotes.",
                "Return structured output only: summary, profile, confidence, caveats, sources.",
            ],
        )
        prompt = (
            "Draft or improve a care profile for this plant. Use short practical phrases suitable for editable profile fields. "
            "If context is thin, fill only broadly supported fields and include caveats.\n"
            "Care profile draft context JSON:\n"
            f"{request.context.model_dump_json(by_alias=True)}"
        )
        response = agent.run(prompt, output_schema=CareProfileDraftOutput)
        content = getattr(response, "content", response)
        if isinstance(content, CareProfileDraftOutput):
            return content
        if isinstance(content, dict):
            return CareProfileDraftOutput.model_validate(content)
        if isinstance(content, str):
            return CareProfileDraftOutput(summary=content, profile={}, confidence=0.35, caveats=["Draft returned as free text; review carefully."])
        return CareProfileDraftOutput.model_validate(content)


    def _openai_home_title(self, request: HomeTitleRequest) -> HomeTitleOutput:
        try:
            from agno.agent import Agent
            from agno.models.openai import OpenAIChat
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Agno OpenAI dependencies are unavailable") from exc

        agent = Agent(
            model=OpenAIChat(id=self.settings.garden_agent_model, api_key=self.settings.openai_api_key),
            instructions=[
                "You write one short Garden Roof Deck home-screen title.",
                "Be highly contextual: use time of day, garden state, attention items, recent activity, weather/location signals when supplied.",
                "Keep the gentle 'your deck/garden is waking up' tone: friendly, personal, calm, and specific.",
                "Return one plain title only. No markdown, no emoji, no quotation marks, no unsupported claims.",
                "Target 45 characters, hard maximum 70 characters.",
            ],
        )
        prompt = (
            "Create one short title for the app home screen from this compact context. "
            "Prefer specific garden signals over generic greeting copy. If context is thin, use a warm waking-up style fallback. Context JSON:\n"
            f"{json.dumps(request.context, ensure_ascii=False)}"
        )
        response = agent.run(prompt, output_schema=HomeTitleOutput)
        content = getattr(response, "content", response)
        if isinstance(content, HomeTitleOutput):
            return content
        if isinstance(content, dict):
            return HomeTitleOutput.model_validate(content)
        if isinstance(content, str):
            return HomeTitleOutput(title=content[:70], confidence=0.4)
        return HomeTitleOutput.model_validate(content)
