from flask import Blueprint, render_template, session, jsonify
from datetime import datetime
from app.routes.auth import login_required
from app.storage import get_tasks_by_user

dashboard_bp = Blueprint("dashboard", __name__)


def _parse_due(due_date_str, due_time_str):
    """Parse due date+time into a naive datetime for comparison."""
    try:
        if due_time_str:
            return datetime.strptime(f"{due_date_str} {due_time_str}", "%Y-%m-%d %H:%M")
        else:
            return datetime.strptime(f"{due_date_str} 23:59", "%Y-%m-%d %H:%M")
    except ValueError:
        return None


def _compute_stats(tasks: dict):
    now = datetime.now()
    total = len(tasks)
    done = 0
    todo = 0
    in_progress = 0
    overdue = 0
    upcoming = []

    for t in tasks.values():
        status = t.get("status", "todo")
        if status == "done":
            done += 1
        elif status == "in_progress":
            in_progress += 1
        else:
            todo += 1

        due_date_str = t.get("due_date", "")
        due_time_str = t.get("due_time", "")
        if due_date_str and status != "done":
            due_dt = _parse_due(due_date_str, due_time_str)
            if due_dt is not None:
                if due_dt < now:
                    overdue += 1
                else:
                    upcoming.append({**t, "_due_dt": due_dt.isoformat()})

    upcoming.sort(key=lambda x: x["_due_dt"])
    for u in upcoming:
        u.pop("_due_dt", None)

    return {
        "total": total,
        "done": done,
        "todo": todo,
        "in_progress": in_progress,
        "overdue": overdue,
        "upcoming": upcoming[:10],
    }


@dashboard_bp.route("/")
@login_required
def index():
    tasks = get_tasks_by_user(session["user_id"])
    stats = _compute_stats(tasks)
    return render_template("dashboard/index.html", stats=stats,
                           user_name=session.get("user_name", ""))


@dashboard_bp.route("/api/stats")
@login_required
def api_stats():
    tasks = get_tasks_by_user(session["user_id"])
    stats = _compute_stats(tasks)
    stats.pop("upcoming", None)
    return jsonify(stats)
