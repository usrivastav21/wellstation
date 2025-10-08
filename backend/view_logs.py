#!/usr/bin/env python3
"""
Log Viewer Script for WellStation Backend
This script helps you view and filter log files easily.
"""

import os
from datetime import datetime
import argparse


def view_logs(log_file, lines=50, filter_level=None, search_term=None, since=None):
    """View logs with various filtering options"""

    if not os.path.exists(log_file):
        print(f"❌ Log file not found: {log_file}")
        return

    print(f"📋 Viewing logs from: {log_file}")
    print(f"🔍 Filter: Level={filter_level}, Search='{search_term}', Since={since}")
    print("=" * 80)

    try:
        with open(log_file, "r", encoding="utf-8") as f:
            all_lines = f.readlines()

        # Apply filters
        filtered_lines = []
        for line in all_lines:
            # Filter by log level
            if filter_level and filter_level.upper() not in line.upper():
                continue

            # Filter by search term
            if search_term and search_term.lower() not in line.lower():
                continue

            # Filter by time (if since is specified)
            if since:
                try:
                    # Extract timestamp from log line (assuming format: YYYY-MM-DD HH:MM:SS)
                    timestamp_str = line.split(" - ")[0]
                    log_time = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S,%f")
                    if log_time < since:
                        continue
                except (ValueError, IndexError):
                    # If we can't parse the timestamp, include the line
                    pass

            filtered_lines.append(line)

        # Show last N lines
        if lines > 0:
            filtered_lines = filtered_lines[-lines:]

        if not filtered_lines:
            print("No logs found matching the specified criteria.")
            return

        for line in filtered_lines:
            # Color code different log levels
            if "ERROR" in line:
                print(f"\033[91m{line.rstrip()}\033[0m")  # Red for errors
            elif "WARNING" in line:
                print(f"\033[93m{line.rstrip()}\033[0m")  # Yellow for warnings
            elif "INFO" in line:
                print(f"\033[94m{line.rstrip()}\033[0m")  # Blue for info
            else:
                print(line.rstrip())

    except Exception as e:
        print(f"❌ Error reading log file: {e}")


def main():
    parser = argparse.ArgumentParser(description="View WellStation backend logs")
    parser.add_argument(
        "--file",
        "-f",
        default="logs/wellstation.log",
        help="Log file to view (default: logs/wellstation.log)",
    )
    parser.add_argument(
        "--lines",
        "-n",
        type=int,
        default=50,
        help="Number of lines to show (default: 50, use 0 for all)",
    )
    parser.add_argument(
        "--level",
        "-l",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Filter by log level",
    )
    parser.add_argument("--search", "-s", help="Search for specific text in logs")
    parser.add_argument(
        "--since", help="Show logs since (format: YYYY-MM-DD or YYYY-MM-DD HH:MM)"
    )
    parser.add_argument(
        "--errors-only",
        action="store_true",
        help="Show only error logs (shortcut for --file logs/wellstation_errors.log)",
    )

    args = parser.parse_args()

    # Handle errors-only shortcut
    if args.errors_only:
        args.file = "logs/wellstation_errors.log"

    # Parse since parameter
    since_time = None
    if args.since:
        try:
            if len(args.since) == 10:  # YYYY-MM-DD
                since_time = datetime.strptime(args.since, "%Y-%m-%d")
            else:  # YYYY-MM-DD HH:MM
                since_time = datetime.strptime(args.since, "%Y-%m-%d %H:%M")
        except ValueError:
            print(f"❌ Invalid date format: {args.since}")
            print("Use format: YYYY-MM-DD or YYYY-MM-DD HH:MM")
            return

    # Check if logs directory exists
    if not os.path.exists("logs"):
        print(
            "❌ Logs directory not found. Make sure the backend has been run at least once."
        )
        return

    view_logs(args.file, args.lines, args.level, args.search, since_time)


if __name__ == "__main__":
    main()
