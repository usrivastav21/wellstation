from .resources import resources_bp


def init_app(app):

    app.register_blueprint(resources_bp)
