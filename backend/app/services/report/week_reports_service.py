from app.db.collections import COLLECTIONS
from app.db.operations import find_data
from app.services.report.report_utils import (
    parse_iso8601_range,
    organize_reports_by_date_iso8601,
)


def fetch_weekly_report_by_date(email: str, date_range: str):
    print(f"Incoming date range parameter: {date_range}")

    start_date, end_date = parse_iso8601_range(date_range)
    if start_date is None or end_date is None:
        return {}

    print(f"Searching from {start_date} to {end_date}")

    report_list = find_data(
        COLLECTIONS["USERS"],
        {"email": email, "created_at": {"$gte": start_date, "$lt": end_date}},
        projection={"_id": 0},
    )

    return organize_reports_by_date_iso8601(
        report_list, include_time=False, start_date=start_date, end_date=end_date
    )
