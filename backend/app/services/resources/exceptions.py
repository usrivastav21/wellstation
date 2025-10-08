"""
Custom exceptions for the Resources service
"""


class ResourcesError(Exception):
    """Base exception for Resources service"""

    pass


class TrialUserRestrictedError(ResourcesError):
    """Raised when a trial user tries to access resources"""

    pass


class UserNotRegisteredError(ResourcesError):
    """Raised when a user is not registered"""

    pass


class MentalHealthScoresNotFoundError(ResourcesError):
    """Raised when mental health scores are not found"""

    pass


class PlaylistNotFoundError(ResourcesError):
    """Raised when no playlist is found for an emotional profile"""

    pass


class ReportNotFoundError(ResourcesError):
    """Raised when a report is not found"""

    pass
