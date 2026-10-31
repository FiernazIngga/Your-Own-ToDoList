from flask import Blueprint, render_template, request, session, jsonify, abort
import uuid
from datetime import datetime
from app.routes.auth import login_required
from app.storage import get_tasks_by_user, get_task_by_id, save_task, delete_task, update_task

tasks_bp = Blueprint("tasks", __name__)

VALID_STATUSES = {"todo", "in_progress", "done"}
VALID_PRIORITIES = {"low", "medium", "high"}


def _validate_task_input(data):
    errors = []
    title = data.get("title", "").strip()
    if not title:
        errors.append("Judul tugas tidak boleh kosong.")
    if len(title) > 200:
        errors.append("Judul tugas maksimal 200 karakter.")

    due_date = data.get("due_date", "").strip()
    if due_date:
        try:
            datetime.strptime(due_date, "%Y-%m-%d")
        except ValueError:
            errors.append("Format tanggal tenggat tidak valid.")

    due_time = data.get("due_time", "").strip()
    if due_time:
        try:
            datetime.strptime(due_time, "%H:%M")
        except ValueError:
            errors.append("Format jam tenggat tidak valid.")

    priority = data.get("priority", "medium").strip()
    if priority not in VALID_PRIORITIES:
        errors.append("Prioritas tidak valid.")

    status = data.get("status", "todo").strip()
    if status not in VALID_STATUSES:
        errors.append("Status tidak valid.")

    return errors


@tasks_bp.route("/tasks")
@login_required
def index():
    return render_template("tasks/index.html", user_name=session.get("user_name", ""))


@tasks_bp.route("/api/tasks", methods=["GET"])
@login_required
def api_list():
    tasks = get_tasks_by_user(session["user_id"])
    task_list = list(tasks.values())

    # Filter
    status_filter = request.args.get("status", "")
    priority_filter = request.args.get("priority", "")
    category_filter = request.args.get("category", "")
    search_query = request.args.get("q", "").strip().lower()
    sort_by = request.args.get("sort", "created_at")
    sort_dir = request.args.get("dir", "desc")

    if status_filter and status_filter in VALID_STATUSES:
        task_list = [t for t in task_list if t.get("status") == status_filter]
    if priority_filter and priority_filter in VALID_PRIORITIES:
        task_list = [t for t in task_list if t.get("priority") == priority_filter]
    if category_filter:
        task_list = [t for t in task_list if t.get("category", "").lower() == category_filter.lower()]
    if search_query:
        task_list = [t for t in task_list
                     if search_query in t.get("title", "").lower()
                     or search_query in t.get("description", "").lower()
                     or search_query in t.get("category", "").lower()]

    # Sort
    reverse = sort_dir == "desc"
    if sort_by == "due_date":
        task_list.sort(key=lambda t: (t.get("due_date") or "9999"), reverse=reverse)
    elif sort_by == "priority":
        prio_order = {"high": 0, "medium": 1, "low": 2}
        task_list.sort(key=lambda t: prio_order.get(t.get("priority", "medium"), 1), reverse=reverse)
    elif sort_by == "title":
        task_list.sort(key=lambda t: t.get("title", "").lower(), reverse=reverse)
    else:
        task_list.sort(key=lambda t: t.get("created_at", ""), reverse=reverse)

    return jsonify(task_list)


@tasks_bp.route("/api/tasks", methods=["POST"])
@login_required
def api_create():
    data = request.get_json(silent=True) or {}
    errors = _validate_task_input(data)
    if errors:
        return jsonify({"error": errors}), 400

    now = datetime.utcnow().isoformat()
    task = {
        "id": str(uuid.uuid4()),
        "user_id": session["user_id"],
        "title": data["title"].strip(),
        "description": data.get("description", "").strip(),
        "category": data.get("category", "").strip(),
        "due_date": data.get("due_date", "").strip(),
        "due_time": data.get("due_time", "").strip(),
        "priority": data.get("priority", "medium").strip(),
        "status": data.get("status", "todo").strip(),
        "created_at": now,
        "updated_at": now,
    }
    save_task(task)
    return jsonify(task), 201


@tasks_bp.route("/api/tasks/<task_id>", methods=["GET"])
@login_required
def api_get(task_id):
    task = get_task_by_id(task_id)
    if not task or task.get("user_id") != session["user_id"]:
        abort(404)
    return jsonify(task)


@tasks_bp.route("/api/tasks/<task_id>", methods=["PUT"])
@login_required
def api_update(task_id):
    task = get_task_by_id(task_id)
    if not task or task.get("user_id") != session["user_id"]:
        abort(404)

    data = request.get_json(silent=True) or {}
    errors = _validate_task_input(data)
    if errors:
        return jsonify({"error": errors}), 400

    updates = {
        "title": data["title"].strip(),
        "description": data.get("description", "").strip(),
        "category": data.get("category", "").strip(),
        "due_date": data.get("due_date", "").strip(),
        "due_time": data.get("due_time", "").strip(),
        "priority": data.get("priority", "medium").strip(),
        "status": data.get("status", "todo").strip(),
    }
    updated = update_task(task_id, updates)
    return jsonify(updated)


@tasks_bp.route("/api/tasks/<task_id>", methods=["DELETE"])
@login_required
def api_delete(task_id):
    task = get_task_by_id(task_id)
    if not task or task.get("user_id") != session["user_id"]:
        abort(404)
    delete_task(task_id)
    return jsonify({"success": True})


@tasks_bp.route("/api/tasks/<task_id>/status", methods=["PATCH"])
@login_required
def api_patch_status(task_id):
    task = get_task_by_id(task_id)
    if not task or task.get("user_id") != session["user_id"]:
        abort(404)
    data = request.get_json(silent=True) or {}
    new_status = data.get("status", "")
    if new_status not in VALID_STATUSES:
        return jsonify({"error": "Status tidak valid."}), 400
    updated = update_task(task_id, {"status": new_status})
    return jsonify(updated)


@tasks_bp.route("/api/categories")
@login_required
def api_categories():
    tasks = get_tasks_by_user(session["user_id"])
    cats = sorted({t.get("category", "").strip() for t in tasks.values() if t.get("category", "").strip()})
    return jsonify(cats)
