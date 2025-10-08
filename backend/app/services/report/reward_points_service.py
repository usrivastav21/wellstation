from app.db.collections import COLLECTIONS
from app.db.operations import update_data, insert_data, find_data
from datetime import datetime, timezone


# def check_if_first_report_of_day(email: str, report_date: datetime):
#     """
#     Check if this is the user's first report of the day.
#     Returns True if this is the first report, False otherwise.
#     """
#     # Convert report_date to start and end of day for comparison
#     start_of_day = report_date.replace(hour=0, minute=0, second=0, microsecond=0)
#     end_of_day = start_of_day.replace(hour=23, minute=59, second=59, microsecond=999999)

#     # Check if there are any existing reports for this user on this date
#     existing_reports = find_data(
#         COLLECTIONS["USERS"],
#         {"email": email, "created_at": {"$gte": start_of_day, "$lte": end_of_day}},
#     )

#     # If no existing reports found, this is the first report of the day
#     return len(existing_reports) == 0


def update_user_rewards(
    email: str, new_streak: int, points_earned: int, report_date: datetime
):
    user = get_user(email)
    if not user:
        return None

    user_id = user.get("user_id")

    update_data(
        COLLECTIONS["USER_AUTH"],
        {"email": email},
        {
            "$inc": {"total_reward_points": points_earned},
            "$set": {
                "current_streak": new_streak,
                "last_report_date": report_date,
                "streak_start_date": (
                    report_date if new_streak == 1 else user["streak_start_date"]
                ),
                "updated_at": datetime.now(timezone.utc),
            },
        },
    )


def record_reward_transaction(
    email: str, points: int, reason: str, streak: int, report_date: datetime
):
    reward_record = {
        "email": email,
        "points_earned": points,
        "reason": reason,
        "streak_count": streak,
        "earned_date": datetime.now(timezone.utc),
        "report_date": report_date,
        "created_at": datetime.now(timezone.utc),
    }
    insert_data(COLLECTIONS["REWARD_POINTS"], reward_record)


def get_user(email: str):
    users = find_data(COLLECTIONS["USER_AUTH"], {"email": email})
    if len(users) > 0:
        return users[0]
    return None


def calculate_rewards(email: str, report_date: datetime):
    """
    Calculate rewards for a user's report.
    Returns a tuple: (points_earned, reason, new_streak)
    """
    # # 1. Check if this is the first report of the day
    # is_first_report = check_if_first_report_of_day(email, report_date)

    # 1. Get user's current streak info
    user = get_user(email)
    if not user:
        return None

    last_report = user.get("last_report_date")
    current_streak = user.get("current_streak", 0)

    # 2. Check if this is consecutive day
    if last_report:
        days_diff = (report_date.date() - last_report.date()).days
        if days_diff == 1:
            # Consecutive day - increment streak
            new_streak = current_streak + 1
        elif days_diff == 0:
            # Same day - no change
            return 0
        else:
            # Gap in streak - reset to 1
            new_streak = 1
    else:
        # First report ever
        new_streak = 1

    # 3. Calculate points
    points_earned = 1  # Base daily point

    # 4. Check for 5-day streak bonus
    if new_streak == 5:
        points_earned += 2  # Bonus points
        reason = "5_day_streak"
    else:
        reason = "daily_checkin"

    # 5. Update user record
    update_user_rewards(email, new_streak, points_earned, report_date)

    # 6. Record reward transaction
    record_reward_transaction(email, points_earned, reason, new_streak, report_date)

    return points_earned


def fetch_reward_points(email: str, report_id: str = None):
    """
    Fetch reward points for a user.
    If current_scan_date is provided, also check if this scan should show rewards modal.
    """
    users = find_data(COLLECTIONS["USER_AUTH"], {"email": email})
    if len(users) > 0:
        total_points = users[0].get("total_reward_points", 0)
        if not report_id:
            return {"total_reward_points": total_points, "should_show_rewards": False}

        report = find_data(COLLECTIONS["USERS"], {"user_Id": report_id})

        if not report:
            return {"total_reward_points": total_points, "should_show_rewards": False}

        start_of_day = (
            report[0]
            .get("created_at")
            .replace(hour=0, minute=0, second=0, microsecond=0)
        )
        end_of_day = start_of_day.replace(
            hour=23, minute=59, second=59, microsecond=999999
        )

        existing_reports = find_data(
            COLLECTIONS["USERS"],
            {"email": email, "created_at": {"$gte": start_of_day, "$lte": end_of_day}},
        )

        should_show_rewards = len(existing_reports) <= 1
        print("data", should_show_rewards, existing_reports, start_of_day, end_of_day)
        return {
            "total_reward_points": total_points,
            "should_show_rewards": should_show_rewards,
        }

    return {"total_reward_points": 0, "should_show_rewards": False}
