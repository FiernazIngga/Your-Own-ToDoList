import os
import json

# Direktori root proyek (satu level di atas folder config/)
_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_SECRET_FILE = os.path.join(_BASE_DIR, "data", ".secret_key")


def _load_or_create_secret():
    """Baca secret key dari file; buat baru jika belum ada."""
    os.makedirs(os.path.dirname(_SECRET_FILE), exist_ok=True)
    if os.path.exists(_SECRET_FILE):
        with open(_SECRET_FILE, "r") as f:
            key = f.read().strip()
            if key:
                return key
    import secrets
    key = secrets.token_hex(32)
    with open(_SECRET_FILE, "w") as f:
        f.write(key)
    return key


class Config:
    BASE_DIR   = _BASE_DIR
    SECRET_KEY = _load_or_create_secret()
    DEBUG      = True
    DATA_DIR   = os.path.join(_BASE_DIR, "data")
    USERS_FILE = os.path.join(_BASE_DIR, "data", "users.json")
    TASKS_FILE = os.path.join(_BASE_DIR, "data", "tasks.json")
    SESSION_PERMANENT       = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
