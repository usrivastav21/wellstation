from app.db.operations import find_data
from app.db.collections import COLLECTIONS
from app.services.report.report_utils import (
    parse_date_input,
    create_date_range,
    organize_reports_by_date_iso8601,
)


def fetch_month_reports(email: str, month: str):
    year, month_num, _ = parse_date_input(month)
    print(year, month_num)
    if year is None:
        return {}

    start_date, end_date = create_date_range(year, month_num)

    report_list = find_data(
        COLLECTIONS["USERS"],
        {"email": email, "created_at": {"$gte": start_date, "$lt": end_date}},
        projection={"_id": 0},
    )

    return organize_reports_by_date_iso8601(report_list)
