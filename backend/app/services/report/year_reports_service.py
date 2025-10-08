from app.db.operations import find_data
from app.db.collections import COLLECTIONS
from app.services.report.report_utils import (
    parse_date_input,
    create_date_range,
)


def fetch_yearly_report_by_date(email: str, date: str):
    year, _, _ = parse_date_input(date)
    if year is None:
        return {}

    start_date, end_date = create_date_range(year)

    print(start_date, end_date)

    report = find_data(
        COLLECTIONS["USERS"],
        {"email": email, "created_at": {"$gte": start_date, "$lt": end_date}},
        projection={"_id": 0},
    )

    quarterly_reports = {}

    # Create entries for all months with empty arrays
    for month in range(1, 13):
        if month == 1:
            quarter_key = f"{year}-01"
        elif month in [2, 3]:
            quarter_key = f"{year}-03"
        elif month in [4, 5]:
            quarter_key = f"{year}-05"
        elif month in [6, 7]:
            quarter_key = f"{year}-07"
        elif month in [8, 9]:
            quarter_key = f"{year}-09"
        elif month in [10, 11]:
            quarter_key = f"{year}-11"
        elif month == 12:
            quarter_key = f"{year}-12"
        else:
            continue

        if quarter_key not in quarterly_reports:
            quarterly_reports[quarter_key] = []

    # Populate with actual reports
    for report_item in report:
        created_at = report_item.get("created_at")
        if created_at:
            if hasattr(created_at, "year") and hasattr(created_at, "month"):
                year = created_at.year
                month = created_at.month
            else:
                try:
                    from datetime import datetime

                    parsed_date = datetime.fromisoformat(
                        str(created_at).replace("Z", "+00:00")
                    )
                    year = parsed_date.year
                    month = parsed_date.month
                except:
                    continue

            # Determine quarter key for this month
            if month == 1:
                quarter_key = f"{year}-01"
            elif month in [2, 3]:
                quarter_key = f"{year}-03"
            elif month in [4, 5]:
                quarter_key = f"{year}-05"
            elif month in [6, 7]:
                quarter_key = f"{year}-07"
            elif month in [8, 9]:
                quarter_key = f"{year}-09"
            elif month in [10, 11]:
                quarter_key = f"{year}-11"
            elif month == 12:
                quarter_key = f"{year}-12"
            else:
                continue

            # Add report to the appropriate quarter
            if quarter_key in quarterly_reports:
                quarterly_reports[quarter_key].append(report_item)

    return quarterly_reports
