from pathlib import Path
import sqlite3


def connect_sqlite(data_dir: str) -> sqlite3.Connection:
    Path(data_dir).mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(Path(data_dir) / "app.sqlite3")
