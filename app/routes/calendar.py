from flask import Blueprint, render_template, session, jsonify, request
from app.routes.auth import login_required
from app.storage import get_tasks_by_user

calendar_bp = Blueprint("calendar", __name__)


@calendar_bp.route("/calendar")
@login_required
def index():
    return render_template("calendar/index.html", user_name=session.get("user_name", ""))


@calendar_bp.route("/api/calendar/tasks")
@login_required
def api_calendar_tasks():
    """Return tasks for a given year/month range for the calendar."""
    year = request.args.get("year", type=int)
    month = request.args.get("month", type=int)

    tasks = get_tasks_by_user(session["user_id"])
    task_list = [t for t in tasks.values() if t.get("due_date")]

    if year and month:
        prefix = f"{year:04d}-{month:02d}"
        task_list = [t for t in task_list if t["due_date"].startswith(prefix)]

    return jsonify(task_list)


@calendar_bp.route("/api/calendar/tasks/range")
@login_required
def api_calendar_range():
    """Return tasks with due_date between start and end (YYYY-MM-DD)."""
    start = request.args.get("start", "")
    end = request.args.get("end", "")

    tasks = get_tasks_by_user(session["user_id"])
    task_list = [t for t in tasks.values() if t.get("due_date")]

    if start:
        task_list = [t for t in task_list if t["due_date"] >= start]
    if end:
        task_list = [t for t in task_list if t["due_date"] <= end]

    return jsonify(task_list)
