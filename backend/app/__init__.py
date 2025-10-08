import os
from flask import Flask
from app.routes.api import api_bp
from app.routes.media import media_bp
from app.routes.resources import resources_bp
from config import DevelopmentConfig, ProductionConfig
from flask_cors import CORS


def create_app(config_class="config.DevelopmentConfig"):
    app = Flask(__name__)
    CORS(app, origins="*", methods=["*"], allow_headers=["*"])
    # CORS().init_app(app)
    # CORS(app, resources={r"/*": {"origins": "*"}})

    if os.getenv("FLASK_ENV") == "production":
        app.config.from_object(ProductionConfig)
    else:
        app.config.from_object(DevelopmentConfig)

    app.config.from_object(config_class)
    api_url_prefix = "/api"

    app.register_blueprint(api_bp, url_prefix=api_url_prefix)
    app.register_blueprint(media_bp, url_prefix=api_url_prefix)
    app.register_blueprint(resources_bp, url_prefix=api_url_prefix)

    return app
