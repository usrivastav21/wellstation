from datetime import datetime, timedelta
import re
from typing import Dict, List, Any, Optional
import math


def parse_date_input(date_input: str) -> tuple:
    """
    Parse different date input formats and return year, month, day components.
    Supports ISO 8601 formats.

    Args:
        date_input: Date string in various formats (YYYY-MM-DD, YYYY-MM, YYYY, ISO 8601)

    Returns:
        tuple: (year, month, day) where month and day can be None
    """
    try:
        # Handle ISO 8601 date range format: YYYY-MM-DD/YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.ZZZZ/YYYY-MM-DDTHH:MM:SS.ZZZZ
        if "/" in date_input:
            start_date_str, end_date_str = date_input.split("/")
            # Parse start date for the main return values
            parsed_start = parse_iso8601_date(start_date_str.strip())
            if parsed_start:
                year = str(parsed_start.year)
                month = str(parsed_start.month).zfill(2)
                day = str(parsed_start.day).zfill(2)
                return year, month, day, start_date_str.strip(), end_date_str.strip()

        # Handle legacy date range format: YYYY-MM-DD - YYYY-MM-DD
        if " - " in date_input:
            start_date_str, end_date_str = date_input.split(" - ")
            # Parse start date for the main return values
            parsed_start = datetime.strptime(start_date_str.strip(), "%Y-%m-%d")
            year = str(parsed_start.year)
            month = str(parsed_start.month).zfill(2)
            day = str(parsed_start.day).zfill(2)
            return year, month, day, start_date_str.strip(), end_date_str.strip()

        # Handle different date formats that might come from frontend
        if re.match(r"^\d{4}-\d{2}-\d{2}$", date_input):
            # Full date format YYYY-MM-DD
            parsed_date = datetime.strptime(date_input, "%Y-%m-%d")
            year = str(parsed_date.year)
            month = str(parsed_date.month).zfill(2)
            day = str(parsed_date.day).zfill(2)
        elif re.match(r"^\d{4}-\d{2}$", date_input):
            # Month format YYYY-MM
            year, month = date_input.split("-")
            day = None
        elif re.match(r"^\d{4}$", date_input):
            # Year format YYYY
            year = date_input
            month = None
            day = None
        else:
            # Try to parse as ISO 8601 format
            parsed_date = parse_iso8601_date(date_input)
            if parsed_date:
                year = str(parsed_date.year)
                month = str(parsed_date.month).zfill(2)
                day = str(parsed_date.day).zfill(2)
            else:
                print(f"Unable to parse date format: {date_input}")
                return None, None, None
    except (ValueError, AttributeError) as e:
        print(f"Date parsing error: {e}")
        return None, None, None

    return year, month, day


def parse_iso8601_date(date_str: str) -> Optional[datetime]:
    """
    Parse ISO 8601 date formats.

    Args:
        date_str: ISO 8601 date string

    Returns:
        datetime object or None if parsing fails
    """
    try:
        if "T" in date_str:
            # Full ISO 8601 format with time
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        else:
            # Date only format YYYY-MM-DD
            return datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, AttributeError):
        return None


def parse_iso8601_range(date_range: str) -> tuple:
    """
    Parse ISO 8601 date range format: YYYY-MM-DD/YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.ZZZZ/YYYY-MM-DDTHH:MM:SS.ZZZZ

    Args:
        date_range: ISO 8601 date range string

    Returns:
        tuple: (start_date, end_date) as datetime objects
    """
    try:
        start_date_str, end_date_str = date_range.split("/")
        start_date = parse_iso8601_date(start_date_str.strip())
        end_date = parse_iso8601_date(end_date_str.strip())

        if start_date and end_date:
            return start_date, end_date
        else:
            print(f"Unable to parse ISO 8601 date range: {date_range}")
            return None, None
    except (ValueError, AttributeError) as e:
        print(f"ISO 8601 date range parsing error: {e}")
        return None, None


def create_date_range(year: str, month: Optional[str] = None) -> tuple:
    """
    Create start and end datetime objects for a given year, month, and optionally day.

    Args:
        year: Year as string
        month: Month as string (can be None for year-only)
        day: Day as string (can be None for month/year-only)

    Returns:
        tuple: (start_date, end_date) as datetime objects
    """
    if month:
        # Month query
        start_date = datetime(int(year), int(month), 1)

        # Calculate end date (next month)
        if month == "12":
            end_year = int(year) + 1
            end_month = 1
        else:
            end_year = int(year)
            end_month = int(month) + 1

        end_date = datetime(end_year, end_month, 1)
    else:
        # Year only search
        start_date = datetime(int(year), 1, 1)
        end_date = datetime(int(year) + 1, 1, 1)

    return start_date, end_date


def organize_reports_by_date_iso8601(
    reports: List[Dict[str, Any]],
    include_time: bool = False,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Organize reports by date using ISO 8601 format as keys.
    If start_date and end_date are provided, creates entries for all dates in the range.

    Args:
        reports: List of report dictionaries
        include_time: Whether to include time in the date key (default: False for date only)
        start_date: Start date for range (optional)
        end_date: End date for range (optional)

    Returns:
        Dict with ISO 8601 date keys and report lists as values
    """
    reports_by_date = {}

    # If date range is provided, create entries for all dates in the range
    if start_date and end_date:
        current_date = start_date
        while current_date <= end_date:
            if include_time:
                date_key = current_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            else:
                date_key = current_date.strftime("%Y-%m-%d")
            reports_by_date[date_key] = []
            current_date += timedelta(days=1)

    # Populate with actual reports
    for report_item in reports:
        created_at = report_item.get("created_at")
        if created_at:
            # Convert datetime to ISO 8601 format
            if isinstance(created_at, datetime):
                if include_time:
                    date_key = created_at.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                else:
                    date_key = created_at.strftime("%Y-%m-%d")
            else:
                # Handle string dates
                try:
                    parsed_date = datetime.fromisoformat(
                        str(created_at).replace("Z", "+00:00")
                    )
                    if include_time:
                        date_key = parsed_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
                    else:
                        date_key = parsed_date.strftime("%Y-%m-%d")
                except:
                    # Fallback to date only if parsing fails
                    date_str = str(created_at)[
                        :10
                    ]  # Take first 10 chars for YYYY-MM-DD
                    date_key = date_str

            # Add report to the appropriate date
            if date_key in reports_by_date:
                reports_by_date[date_key].append(report_item)
            elif not start_date and not end_date:
                # If no range provided, create entry dynamically
                if date_key not in reports_by_date:
                    reports_by_date[date_key] = []
                reports_by_date[date_key].append(report_item)

    return reports_by_date


def get_interval(n):
    """Get all factors of a given number and find a value in range [5, 7]"""

    if n <= 0:
        return []

    factors = []
    for i in range(1, int(n**0.5) + 1):
        if n % i == 0:
            factors.append(i)
            if i != n // i:  # Avoid adding the same factor twice for perfect squares
                factors.append(n // i)

    factors = sorted(factors)

    for factor in factors:
        result = n / factor + 1
        result = math.ceil(result)
        if 5 <= result <= 7:
            return result, factor

    # If no factor works, try subsequent values starting from the largest factor
    # that gives a result closest to our range
    best_factor = None
    for factor in reversed(factors):  # Start from largest factors
        result = n / factor + 1
        if result > 7:  # If result is too large, this factor is a good starting point
            best_factor = factor
            break

    # If we found a good starting factor, increment it until we get in range
    if best_factor:
        test_factor = best_factor + 1
        while test_factor <= n:
            result = n / test_factor + 1
            result = math.ceil(result)
            if 5 <= result <= 7:
                return result, test_factor
            test_factor += 1

    # For prime numbers or when no factor works, start from factor 2 and above
    for test_factor in range(2, n + 1):
        result = n / test_factor + 1
        result = math.ceil(result)
        if 5 <= result <= 7:
            return result, test_factor

    return 5, 5
