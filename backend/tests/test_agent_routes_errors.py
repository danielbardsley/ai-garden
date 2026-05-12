import json

from fastapi.testclient import TestClient

from app.app_factory import create_app
from app.config import Settings


def test_photo_categorization_rejects_invalid_event_json(tmp_path) -> None:
    client = TestClient(create_app(Settings(data_dir=str(tmp_path), openai_api_key=None)))

    response = client.post(
        "/agent/photo-categorizations",
        data={"event": "not-json"},
        files={"photo": ("plant.jpg", b"fake", "image/jpeg")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid event payload"


def test_photo_identification_rejects_invalid_event_payload(tmp_path) -> None:
    client = TestClient(create_app(Settings(data_dir=str(tmp_path), openai_api_key=None)))

    response = client.post(
        "/agent/photo-identifications",
        data={"event": json.dumps({"eventId": "missing-required-fields"})},
        files={"photo": ("plant.jpg", b"fake", "image/jpeg")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid event payload"


def test_get_missing_run_returns_404(tmp_path) -> None:
    client = TestClient(create_app(Settings(data_dir=str(tmp_path), openai_api_key=None)))

    response = client.get("/agent/runs/run-missing")

    assert response.status_code == 404


def test_home_title_without_provider_fails_gracefully(tmp_path) -> None:
    client = TestClient(create_app(Settings(data_dir=str(tmp_path), openai_api_key=None)))

    response = client.post(
        "/agent/home-title",
        json={
            "requestId": "home-title-test",
            "occurredAt": "2026-05-11T20:00:00Z",
            "context": {"gardenName": "Back Garden", "timeOfDay": "evening"},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "failed"
    assert payload["providerConfigured"] is False
