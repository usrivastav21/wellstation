from app.db.operations import find_data
from app.db.collections import COLLECTIONS
from app.services.report.report_utils import (
    parse_iso8601_date,
    organize_reports_by_date_iso8601,
)
from datetime import timedelta


def fetch_report_by_date(email: str, date: str):
    print(f"Incoming date parameter: {date}")

    parsed_date = parse_iso8601_date(date)
    if parsed_date is None:
        return {}

    start_date = parsed_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = start_date + timedelta(days=1)

    print(f"Searching for reports on {start_date.date()}")

    report = find_data(
        COLLECTIONS["USERS"],
        {"email": email, "created_at": {"$gte": start_date, "$lt": end_date}},
        projection={"_id": 0},
    )

    return organize_reports_by_date_iso8601(report)
