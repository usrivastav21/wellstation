from functools import wraps

from flask import current_app, jsonify, request, g
import jwt


def login_required(allowed_roles=None):

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = None
            if "Authorization" in request.headers:
                token = request.headers["Authorization"].split(" ")[1]

            if not token:
                return jsonify({"error": "Missing token"}), 401

            try:
                payload = jwt.decode(
                    token,
                    current_app.config["JWT_SECRET_KEY"],
                    algorithms=[current_app.config["JWT_ALGORITHM"]],
                )
                user_role = payload.get("role")

                if allowed_roles and user_role not in allowed_roles:
                    return jsonify({"error": "Access denied"}), 403

                g.user = payload
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401

            return f(*args, **kwargs)

        return wrapper

    return decorator
