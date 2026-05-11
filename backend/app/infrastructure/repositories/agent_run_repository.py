from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.agent.schemas import AgentEventRequest, AgentRunStatus


class AgentRunRepository:
    def __init__(self, data_dir: str) -> None:
        Path(data_dir).mkdir(parents=True, exist_ok=True)
        self.database_path = Path(data_dir) / "agent.sqlite3"
        self._migrate()

    def create_run(self, event: AgentEventRequest, *, provider: str, model: str | None, status: str = "queued") -> AgentRunStatus:
        run_id = f"run-{uuid4()}"
        now = _now()
        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO agent_runs (
                  run_id, event_id, event_type, entity_type, entity_id, plant_id, occurred_at,
                  status, provider, model, context_json, output_json, error_message,
                  prompt_tokens, completion_tokens, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    run_id,
                    event.event_id,
                    event.event_type,
                    event.entity_type,
                    event.entity_id,
                    event.plant_id,
                    event.occurred_at,
                    status,
                    provider,
                    model,
                    json.dumps(event.context),
                    None,
                    None,
                    None,
                    None,
                    now,
                    now,
                ),
            )
        return self.get_run(run_id)

    def complete_run(
        self,
        run_id: str,
        *,
        output: dict[str, Any],
        prompt_tokens: int | None = None,
        completion_tokens: int | None = None,
    ) -> AgentRunStatus:
        with self._connect() as connection:
            connection.execute(
                """
                UPDATE agent_runs
                SET status = ?, output_json = ?, prompt_tokens = ?, completion_tokens = ?, updated_at = ?
                WHERE run_id = ?
                """,
                ("succeeded", json.dumps(output), prompt_tokens, completion_tokens, _now(), run_id),
            )
        return self.get_run(run_id)

    def fail_run(self, run_id: str, error_message: str) -> AgentRunStatus:
        with self._connect() as connection:
            connection.execute(
                "UPDATE agent_runs SET status = ?, error_message = ?, updated_at = ? WHERE run_id = ?",
                ("failed", error_message, _now(), run_id),
            )
        return self.get_run(run_id)

    def get_run(self, run_id: str) -> AgentRunStatus:
        with self._connect() as connection:
            row = connection.execute("SELECT * FROM agent_runs WHERE run_id = ?", (run_id,)).fetchone()
        if row is None:
            raise KeyError(run_id)
        return _row_to_status(row)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _migrate(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS agent_runs (
                  run_id TEXT PRIMARY KEY,
                  event_id TEXT NOT NULL,
                  event_type TEXT NOT NULL,
                  entity_type TEXT,
                  entity_id TEXT,
                  plant_id TEXT,
                  occurred_at TEXT,
                  status TEXT NOT NULL,
                  provider TEXT,
                  model TEXT,
                  context_json TEXT,
                  output_json TEXT,
                  error_message TEXT,
                  prompt_tokens INTEGER,
                  completion_tokens INTEGER,
                  created_at TEXT NOT NULL,
                  updated_at TEXT NOT NULL
                )
                """
            )


def _row_to_status(row: sqlite3.Row) -> AgentRunStatus:
    return AgentRunStatus(
        runId=row["run_id"],
        eventId=row["event_id"],
        eventType=row["event_type"],
        status=row["status"],
        output=json.loads(row["output_json"]) if row["output_json"] else None,
        errorMessage=row["error_message"],
        provider=row["provider"],
        model=row["model"],
        promptTokens=row["prompt_tokens"],
        completionTokens=row["completion_tokens"],
        createdAt=row["created_at"],
        updatedAt=row["updated_at"],
    )


def _now() -> str:
    return datetime.now(UTC).isoformat()
