from .resources import resources_bp
from .media import media_bp


def init_app(app):
    app.register_blueprint(media_bp, url_prefix='/api')
    app.register_blueprint(resources_bp)
