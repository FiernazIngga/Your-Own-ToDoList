from flask import Flask
from config.settings import Config
from app.routes.auth import auth_bp
from app.routes.dashboard import dashboard_bp
from app.routes.tasks import tasks_bp
from app.routes.calendar import calendar_bp


def create_app():
    app = Flask(__name__,
                template_folder="templates",
                static_folder="static")
    app.config.from_object(Config)

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(calendar_bp)

    return app
