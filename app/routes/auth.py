from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import datetime
from app.storage import get_user_by_email, save_user, get_user_by_id

auth_bp = Blueprint("auth", __name__)


def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.login"))
        return f(*args, **kwargs)
    return decorated


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if "user_id" in session:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm_password", "")

        errors = []
        if not name or len(name) < 2:
            errors.append("Nama harus minimal 2 karakter.")
        if not email or "@" not in email or "." not in email.split("@")[-1]:
            errors.append("Format email tidak valid.")
        if len(password) < 8:
            errors.append("Kata sandi harus minimal 8 karakter.")
        if password != confirm:
            errors.append("Konfirmasi kata sandi tidak cocok.")
        if get_user_by_email(email):
            errors.append("Email sudah terdaftar.")

        if errors:
            return render_template("auth/register.html", errors=errors,
                                   name=name, email=email)

        user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "password_hash": generate_password_hash(password),
            "created_at": datetime.utcnow().isoformat(),
        }
        save_user(user)
        flash("Akun berhasil dibuat. Silakan login.", "success")
        return redirect(url_for("auth.login"))

    return render_template("auth/register.html", errors=[], name="", email="")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if "user_id" in session:
        return redirect(url_for("dashboard.index"))

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")

        user = get_user_by_email(email)
        if not user or not check_password_hash(user["password_hash"], password):
            return render_template("auth/login.html",
                                   error="Email atau kata sandi salah.", email=email)

        session.clear()
        session["user_id"] = user["id"]
        session["user_name"] = user["name"]
        return redirect(url_for("dashboard.index"))

    return render_template("auth/login.html", error=None, email="")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
