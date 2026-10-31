import json
import os
import tempfile
import shutil
from datetime import datetime


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")


def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)


def _read_json(filepath):
    if not os.path.exists(filepath):
        return {}
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return {}
            return json.loads(content)
    except (json.JSONDecodeError, OSError):
        return {}


def _write_json(filepath, data):
    _ensure_data_dir()
    dir_name = os.path.dirname(filepath)
    fd, tmp_path = tempfile.mkstemp(dir=dir_name, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        shutil.move(tmp_path, filepath)
    except Exception:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass
        raise


# ── Users ──────────────────────────────────────────────────────────────────────

def get_all_users():
    return _read_json(USERS_FILE)


def get_user_by_email(email):
    users = get_all_users()
    return users.get(email.lower())


def get_user_by_id(user_id):
    users = get_all_users()
    for user in users.values():
        if user.get("id") == user_id:
            return user
    return None


def save_user(user):
    users = get_all_users()
    users[user["email"].lower()] = user
    _write_json(USERS_FILE, users)


# ── Tasks ──────────────────────────────────────────────────────────────────────

def get_all_tasks():
    return _read_json(TASKS_FILE)


def get_tasks_by_user(user_id):
    all_tasks = get_all_tasks()
    return {tid: t for tid, t in all_tasks.items() if t.get("user_id") == user_id}


def get_task_by_id(task_id):
    return get_all_tasks().get(task_id)


def save_task(task):
    all_tasks = get_all_tasks()
    all_tasks[task["id"]] = task
    _write_json(TASKS_FILE, all_tasks)


def delete_task(task_id):
    all_tasks = get_all_tasks()
    if task_id in all_tasks:
        del all_tasks[task_id]
        _write_json(TASKS_FILE, all_tasks)
        return True
    return False


def update_task(task_id, updates):
    all_tasks = get_all_tasks()
    if task_id not in all_tasks:
        return None
    all_tasks[task_id].update(updates)
    all_tasks[task_id]["updated_at"] = datetime.utcnow().isoformat()
    _write_json(TASKS_FILE, all_tasks)
    return all_tasks[task_id]
