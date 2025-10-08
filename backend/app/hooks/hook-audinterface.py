# PyInstaller hook for audinterface
from PyInstaller.utils.hooks import collect_dynamic_libs

# Collect all dynamic libraries from audinterface
binaries = collect_dynamic_libs("audinterface")

# Add hidden imports
hiddenimports = [
    "audinterface",
    "audinterface.core",
    "audinterface.core.utils",
]
