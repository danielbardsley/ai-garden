import json

import pytest

from app.agent.schemas import (
    AgentEventRequest,
    CareRecommendationOutput,
    CareRecommendationRequest,
    CareProfileDraftOutput,
    CareProfileDraftRequest,
    PhotoIdentificationOutput,
    PhotoIdentificationRequest,
    PlantChatOutput,
    PlantChatRequest,
)
from app.config import Settings
from app.infrastructure.database import connect_sqlite
from app.infrastructure.repositories.agent_run_repository import AgentRunRepository


def test_photo_identification_output_aliases() -> None:
    output = PhotoIdentificationOutput(
        visualCommonName="Snake plant",
        openIdentification="The plant appears most like a snake plant.",
        summary="Likely a snake plant.",
        plantMatches=[],
    )

    data = output.model_dump(by_alias=True)

    assert data["visualCommonName"] == "Snake plant"
    assert data["openIdentification"].startswith("The plant")
    assert data["plantMatches"] == []


def test_care_profile_draft_schema_aliases() -> None:
    request = CareProfileDraftRequest(
        requestId="draft-1",
        plantId="plant-1",
        occurredAt="2026-05-09T18:30:00Z",
        context={"plant": {"id": "plant-1"}, "careProfile": None},
    )
    output = CareProfileDraftOutput(
        summary="Drafted.",
        profile={"lightPreference": "Bright shade"},
        caveats=["Review."],
    )

    assert request.model_dump(by_alias=True)["requestId"] == "draft-1"
    assert output.model_dump(by_alias=True)["profile"]["lightPreference"] == "Bright shade"


def test_care_recommendation_schema_aliases() -> None:
    request = CareRecommendationRequest(
        requestId="request-1",
        plantId="plant-1",
        occurredAt="2026-05-09T18:30:00Z",
        context={"plant": {"id": "plant-1"}, "recentCareEvents": []},
    )
    output = CareRecommendationOutput(
        summary="Check care.",
        recommendations=[{"recommendationType": "watered", "title": "Check soil", "confidence": 0.7}],
    )

    assert request.model_dump(by_alias=True)["requestId"] == "request-1"
    assert output.model_dump(by_alias=True)["recommendations"][0]["recommendationType"] == "watered"


def test_plant_chat_schema_aliases() -> None:
    request = PlantChatRequest(
        messageId="message-1",
        conversationId="conversation-1",
        plantId="plant-1",
        occurredAt="2026-05-09T18:30:00Z",
        question="Should I water?",
        context={"plant": {"id": "plant-1"}, "recentObservations": []},
    )
    output = PlantChatOutput(answer="Check soil first.", suggestedQuestions=["What changed?"], sources=[{"kind": "plant", "id": "plant-1"}])

    assert request.model_dump(by_alias=True)["conversationId"] == "conversation-1"
    assert output.model_dump(by_alias=True)["suggestedQuestions"] == ["What changed?"]


def test_agent_run_repository_persists_success_and_failure(tmp_path) -> None:
    repository = AgentRunRepository(str(tmp_path))
    event = AgentEventRequest(
        eventId="event-repo",
        eventType="photo.captured",
        entityType="photo",
        entityId="photo-1",
        plantId="plant-1",
        occurredAt="2026-05-08T12:00:00Z",
        context={"photo": {"localOnly": True}},
    )

    run = repository.create_run(event, provider="openai", model="gpt-5.5", status="running")
    completed = repository.complete_run(run.run_id, output={"summary": "ok"}, prompt_tokens=2, completion_tokens=3)

    assert completed.status == "succeeded"
    assert completed.output == {"summary": "ok"}
    assert completed.prompt_tokens == 2
    assert completed.completion_tokens == 3

    failed_run = repository.create_run(event, provider="openai", model="gpt-5.5", status="running")
    failed = repository.fail_run(failed_run.run_id, "boom")
    assert failed.status == "failed"
    assert failed.error_message == "boom"


def test_agent_run_repository_missing_run_raises_key_error(tmp_path) -> None:
    repository = AgentRunRepository(str(tmp_path))
    with pytest.raises(KeyError):
        repository.get_run("missing")


def test_connect_sqlite_creates_database(tmp_path) -> None:
    connection = connect_sqlite(str(tmp_path))
    try:
        connection.execute("CREATE TABLE sample (id TEXT PRIMARY KEY)")
        connection.execute("INSERT INTO sample (id) VALUES ('one')")
        row = connection.execute("SELECT id FROM sample").fetchone()
    finally:
        connection.close()

    assert row[0] == "one"
    assert (tmp_path / "app.sqlite3").exists()
