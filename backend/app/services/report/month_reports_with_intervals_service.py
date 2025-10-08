from app.db.operations import find_data
from app.db.collections import COLLECTIONS
from app.services.report.report_utils import (
    parse_date_input,
    create_date_range,
    get_interval,
)
import math
from calendar import monthrange


def fetch_monthly_report_by_date(email: str, month: str):
    print(f"Incoming month parameter: {month}")

    year, month_num, _ = parse_date_input(month)
    if year is None:
        return {}

    start_date, end_date = create_date_range(year, month_num)

    report_list = find_data(
        COLLECTIONS["USERS"],
        {"email": email, "created_at": {"$gte": start_date, "$lt": end_date}},
        projection={"_id": 0},
    )

    if month_num:
        days_in_month = monthrange(int(year), int(month_num))[1]
    else:
        days_in_month = 365

    _, interval_size = get_interval(days_in_month)

    print(interval_size)

    grouped_reports = {}

    day1_key = f"{year}-{month_num.zfill(2) if month_num else '01'}-01"
    grouped_reports[day1_key] = []

    remaining_days = days_in_month - 1  # Exclude day 1
    total_intervals = math.ceil(remaining_days / interval_size)

    for interval_num in range(1, total_intervals + 1):
        interval_start = 2 + ((interval_num - 1) * interval_size)
        interval_end = min(interval_start + interval_size - 1, days_in_month)

        start_date_str = f"{year}-{month_num.zfill(2) if month_num else '01'}-{str(interval_start).zfill(2)}"
        end_date_str = f"{year}-{month_num.zfill(2) if month_num else '01'}-{str(interval_end).zfill(2)}"
        interval_key = f"{start_date_str}/{end_date_str}"

        grouped_reports[interval_key] = []

    for report_item in report_list:
        created_at = report_item.get("created_at")
        if created_at:
            day = created_at.day

            if day == 1:
                interval_key = f"{year}-{month_num.zfill(2) if month_num else '01'}-01"
            else:
                interval_number = math.ceil((day - 1) / interval_size)
                interval_start = 2 + ((interval_number - 1) * interval_size)
                interval_end = min(interval_start + interval_size - 1, days_in_month)

                start_date_str = f"{year}-{month_num.zfill(2) if month_num else '01'}-{str(interval_start).zfill(2)}"
                end_date_str = f"{year}-{month_num.zfill(2) if month_num else '01'}-{str(interval_end).zfill(2)}"
                interval_key = f"{start_date_str}/{end_date_str}"

            if interval_key in grouped_reports:
                grouped_reports[interval_key].append(report_item)

    return grouped_reports
