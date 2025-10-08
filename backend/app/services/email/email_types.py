from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class EmailType:
    template_name: str
    subject_template: str
    required_variables: List[str]
    default_data: Dict[str, Any]


# Define all email types and their configurations
EMAIL_TYPES = {
    "wellbeing_report": EmailType(
        template_name="wellbeing_report",
        subject_template="Your W3LL Station Wellbeing Report",
        required_variables=["report_link"],
        default_data={
            "tea_link": "https://www.tea-ideas.com/discount/W3LL%2520Station",
            "coco_veda": "https://cocoveda.sg/",
            "catch_link": "https://www.catch.sg/",
            "logo_url": "https://w3assets.blob.core.windows.net/public/well_station_logo.png",
            "companion_logo_url": "https://w3assets.blob.core.windows.net/public/wellstation_companion_logo.png",
            "girl_holding_phone": "https://w3assets.blob.core.windows.net/public/wellstation_girl_holding_phone.png",
            "waitlist_link": "https://docs.google.com/forms/d/1xC2z7OfViSCF2uM2MNq3b5YC0tontrmkcVOlyHldeAk/prefill",
        },
    ),
    "pin_reset": EmailType(
        template_name="pin_reset",
        subject_template="Reset Pin Request from W3LL Station",
        required_variables=["temp_pin"],
        default_data={
            "logo_url": "https://w3assets.blob.core.windows.net/public/well_station_logo.png",
            "expiry_hours": 24,
        },
    ),
}
