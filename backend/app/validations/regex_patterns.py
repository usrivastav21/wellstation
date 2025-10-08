import re

PIN_REGEX = re.compile(r"^[a-zA-Z0-9]{6}$")  # exactly six alphanumeric characters

EMAIL_REGEX = re.compile(r"[^@]+@[^@]+\.[^@]+")
