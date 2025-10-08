import os
from pathlib import Path
from typing import Dict, Any, Optional
import logging


class EmailTemplateManager:
    def __init__(self):
        # Get the directory where this file is located
        current_dir = Path(__file__).parent
        self.templates_dir = current_dir / "templates"
        self._templates_cache = {}

        self.templates_dir.mkdir(exist_ok=True)

    def get_template(self, template_name: str) -> str:
        """Get template with caching for performance"""
        if template_name not in self._templates_cache:
            template_path = self.templates_dir / f"{template_name}.html"
            try:
                with open(template_path, "r", encoding="utf-8") as file:
                    self._templates_cache[template_name] = file.read()
            except FileNotFoundError:
                logging.error(f"Template {template_name} not found at {template_path}")
                raise FileNotFoundError(f"Email template '{template_name}' not found")
        return self._templates_cache[template_name]

    def render_template(self, template_name: str, data: Dict[str, Any]) -> str:
        """Render template with provided data"""
        template = self.get_template(template_name)
        try:
            return template.format(**data)
        except KeyError as e:
            logging.error(f"Missing template variable: {e}")
            raise ValueError(f"Template variable {e} is required but not provided")

    def clear_cache(self):
        """Clear template cache (useful for development)"""
        self._templates_cache.clear()
