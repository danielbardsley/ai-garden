import json

from fastapi.testclient import TestClient

from app.agent.garden_agent import GardenAgent
from app.app_factory import create_app
from app.config import Settings


def fake_categorization(self, event, *, image_bytes, mime_type):
    return (
        {
            "summary": "Fake categorization from test double.",
            "tags": [{"label": "test tag", "confidence": 0.8}],
            "category": {"label": "general_photo_log", "confidence": 0.7},
            "insight": {"title": "Test insight", "body": "Test body", "kind": "summary", "confidence": 0.6},
            "careRecommendation": None,
            "confidence": 0.7,
        },
        {"prompt_tokens": 1, "completion_tokens": 2},
    )


def fake_identification(self, event, *, image_bytes, mime_type):
    return (
        {
            "visualCommonName": "Snake plant",
            "openIdentification": "The plant appears most like a snake plant.",
            "summary": "Likely a snake plant.",
            "plantMatches": [
                {
                    "plantId": "snake",
                    "displayName": "Snake plant",
                    "commonName": "Snake plant",
                    "varietyName": None,
                    "confidence": 0.82,
                    "rationale": "Test double selected the supplied plant.",
                }
            ],
            "tags": [{"label": "upright leaves", "confidence": 0.8}],
            "category": {"label": "general_photo_log", "confidence": 0.7},
            "insight": {"title": "Test insight", "body": "Test body", "kind": "summary", "confidence": 0.6},
            "careRecommendation": None,
            "confidence": 0.82,
        },
        {"prompt_tokens": 3, "completion_tokens": 4},
    )


def fake_plant_chat(self, request):
    return (
        {
            "answer": "Based on the latest notes, check soil moisture before watering.",
            "summary": "Discussed watering check.",
            "suggestedQuestions": ["What should I watch next?"],
            "confidence": 0.72,
            "sources": [{"kind": "observation", "id": "obs-1", "label": "Latest note"}],
        },
        {"prompt_tokens": 5, "completion_tokens": 6},
    )


def fake_care_recommendations(self, request):
    return (
        {
            "summary": "One care suggestion from test double.",
            "recommendations": [
                {
                    "recommendationType": "watered",
                    "title": "Check soil moisture",
                    "body": "The latest notes suggest checking before watering.",
                    "dueOn": None,
                    "confidence": 0.74,
                    "rationale": "Recent care history is sparse.",
                    "sources": [{"kind": "care_event", "id": "care-1", "label": "Last watering"}],
                }
            ],
            "confidence": 0.74,
        },
        {"prompt_tokens": 7, "completion_tokens": 8},
    )


def fake_care_profile_draft(self, request):
    return (
        {
            "summary": "Drafted a starter profile.",
            "profile": {
                "lightPreference": "Bright indirect light",
                "wateringRhythm": "Check weekly",
                "generalNotes": "Review against local conditions.",
            },
            "confidence": 0.68,
            "caveats": ["Context is sparse."],
            "sources": [{"kind": "plant", "id": "snake", "label": "Plant record"}],
        },
        {"prompt_tokens": 9, "completion_tokens": 10},
    )


def test_submit_photo_captured_event_with_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(GardenAgent, "run_photo_categorization", fake_categorization)
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)

    response = client.post(
        "/agent/events",
        json={
            "eventId": "event-1",
            "eventType": "photo.captured",
            "entityType": "photo",
            "entityId": "photo-1",
            "plantId": "snake",
            "occurredAt": "2026-05-08T04:30:00Z",
            "context": {"plant": {"commonName": "Snake plant"}},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "succeeded"
    assert body["providerConfigured"] is True
    assert body["output"]["summary"] == "Fake categorization from test double."

    run_response = client.get(f"/agent/runs/{body['runId']}")
    assert run_response.status_code == 200
    run = run_response.json()
    assert run["output"]["tags"][0]["label"] == "test tag"
    assert run["promptTokens"] == 1


def test_submit_photo_categorization_upload_with_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(GardenAgent, "run_photo_categorization", fake_categorization)
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)
    event = {
        "eventId": "event-2",
        "eventType": "photo.captured",
        "entityType": "photo",
        "entityId": "photo-2",
        "plantId": "basil",
        "occurredAt": "2026-05-08T04:30:00Z",
        "context": {"plant": {"displayName": "Genovese"}},
    }

    response = client.post(
        "/agent/photo-categorizations",
        data={"event": json.dumps(event)},
        files={"photo": ("plant.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "succeeded"
    assert body["output"]["insight"]["body"] == "Test body"


def test_submit_photo_identification_upload_with_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(GardenAgent, "run_photo_identification", fake_identification)
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)
    event = {
        "eventId": "event-identify-1",
        "eventType": "photo.identification_requested",
        "occurredAt": "2026-05-08T16:00:00Z",
        "launchedFromPlantId": "snake",
        "capture": {"width": 1024, "height": 768, "mimeType": "image/jpeg", "capturedOn": "2026-05-08"},
        "context": {
            "plants": [
                {"id": "snake", "displayName": "Snake plant", "commonName": "Snake plant"},
            ],
            "app": {"platform": "android", "schemaVersion": 3},
        },
    }

    response = client.post(
        "/agent/photo-identifications",
        data={"event": json.dumps(event)},
        files={"photo": ("plant.jpg", b"fake-image-bytes", "image/jpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "succeeded"
    assert body["output"]["visualCommonName"] == "Snake plant"
    assert body["output"]["plantMatches"][0]["plantId"] == "snake"


def test_submit_photo_identification_rejects_non_image(tmp_path) -> None:
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)
    event = {
        "eventId": "event-identify-2",
        "eventType": "photo.identification_requested",
        "occurredAt": "2026-05-08T16:00:00Z",
        "capture": {"capturedOn": "2026-05-08"},
        "context": {"plants": []},
    }

    response = client.post(
        "/agent/photo-identifications",
        data={"event": json.dumps(event)},
        files={"photo": ("plant.txt", b"not-image", "text/plain")},
    )

    assert response.status_code == 400


def test_missing_openai_key_fails_without_production_mock(tmp_path) -> None:
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key=None))
    client = TestClient(app)

    response = client.post(
        "/agent/events",
        json={"eventId": "event-no-key", "eventType": "photo.captured", "context": {}},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["providerConfigured"] is False
    assert body["status"] == "failed"
    assert body["output"] is None
    run = client.get(f"/agent/runs/{body['runId']}").json()
    assert run["errorMessage"] == "OpenAI API key is not configured"


def test_submit_plant_chat_with_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(GardenAgent, "run_plant_chat", fake_plant_chat)
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)

    response = client.post(
        "/agent/plant-chat",
        json={
            "messageId": "message-1",
            "conversationId": "conversation-snake",
            "plantId": "snake",
            "occurredAt": "2026-05-09T18:30:00Z",
            "question": "Should I water today?",
            "context": {
                "plant": {"id": "snake", "displayName": "Snake plant"},
                "recentObservations": [{"id": "obs-1", "note": "Soil was dry."}],
                "app": {"schemaVersion": 1},
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "succeeded"
    assert body["output"]["answer"].startswith("Based on the latest notes")
    assert body["output"]["sources"][0]["id"] == "obs-1"
    run = client.get(f"/agent/runs/{body['runId']}").json()
    assert run["eventType"] == "plant.chat_requested"
    assert run["output"]["summary"] == "Discussed watering check."


def test_submit_plant_chat_without_key_fails_safely(tmp_path) -> None:
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key=None))
    client = TestClient(app)

    response = client.post(
        "/agent/plant-chat",
        json={
            "messageId": "message-no-key",
            "conversationId": "conversation-snake",
            "plantId": "snake",
            "occurredAt": "2026-05-09T18:30:00Z",
            "question": "Should I water today?",
            "context": {"plant": {"id": "snake"}},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["providerConfigured"] is False
    assert body["status"] == "failed"
    assert body["output"] is None


def test_submit_care_recommendations_with_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(GardenAgent, "run_care_recommendations", fake_care_recommendations)
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)

    response = client.post(
        "/agent/care-recommendations",
        json={
            "requestId": "care-request-1",
            "plantId": "snake",
            "occurredAt": "2026-05-09T18:30:00Z",
            "context": {
                "plant": {"id": "snake", "displayName": "Snake plant"},
                "recentCareEvents": [],
                "careRecommendations": [],
            },
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "succeeded"
    assert body["output"]["recommendations"][0]["title"] == "Check soil moisture"
    run = client.get(f"/agent/runs/{body['runId']}").json()
    assert run["eventType"] == "plant.care_recommendations_requested"
    assert run["output"]["summary"] == "One care suggestion from test double."


def test_submit_care_recommendations_without_key_fails_safely(tmp_path) -> None:
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key=None))
    client = TestClient(app)

    response = client.post(
        "/agent/care-recommendations",
        json={
            "requestId": "care-request-no-key",
            "plantId": "snake",
            "occurredAt": "2026-05-09T18:30:00Z",
            "context": {"plant": {"id": "snake"}},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["providerConfigured"] is False
    assert body["status"] == "failed"
    assert body["output"] is None


def test_submit_care_profile_draft_with_test_double(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(GardenAgent, "run_care_profile_draft", fake_care_profile_draft)
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key="test-key"))
    client = TestClient(app)

    response = client.post(
        "/agent/care-profile-draft",
        json={
            "requestId": "profile-draft-1",
            "plantId": "snake",
            "occurredAt": "2026-05-09T18:30:00Z",
            "context": {"plant": {"id": "snake", "displayName": "Snake plant"}, "careProfile": None},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "succeeded"
    assert body["output"]["profile"]["lightPreference"] == "Bright indirect light"
    run = client.get(f"/agent/runs/{body['runId']}").json()
    assert run["eventType"] == "plant.care_profile_draft_requested"


def test_submit_care_profile_draft_without_key_fails_safely(tmp_path) -> None:
    app = create_app(Settings(data_dir=str(tmp_path), openai_api_key=None))
    client = TestClient(app)

    response = client.post(
        "/agent/care-profile-draft",
        json={
            "requestId": "profile-draft-no-key",
            "plantId": "snake",
            "occurredAt": "2026-05-09T18:30:00Z",
            "context": {"plant": {"id": "snake"}},
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["providerConfigured"] is False
    assert body["status"] == "failed"
    assert body["output"] is None
