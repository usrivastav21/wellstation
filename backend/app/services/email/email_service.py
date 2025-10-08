import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
from .template_manager import EmailTemplateManager
from .email_types import EMAIL_TYPES, EmailType


class EmailService:
    def __init__(self):
        self.sender_email = os.getenv("EMAIL")
        self.sender_password = os.getenv("EMAIL_PASSWORD")
        self.smtp_server = "smtp.office365.com"
        self.smtp_port = 587

        # Validate configuration
        if not self.sender_email or not self.sender_password:
            raise ValueError("Email credentials not properly configured")

        # Initialize template manager
        self.template_manager = EmailTemplateManager()

    def send_email(
        self,
        email_type: str,
        to_email: str,
        custom_data: Dict[str, Any],
        custom_subject: Optional[str] = None,
    ) -> bool:
        """
        Send email using predefined email types

        Args:
            email_type: Type of email (e.g., 'wellbeing_report', 'pin_reset')
            to_email: Recipient email address
            custom_data: Data specific to this email
            custom_subject: Optional custom subject (overrides default)

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            if email_type not in EMAIL_TYPES:
                raise ValueError(f"Unknown email type: {email_type}")

            email_config = EMAIL_TYPES[email_type]
            self._validate_required_variables(email_config, custom_data)

            email_data = {**email_config.default_data, **custom_data}

            subject = custom_subject or email_config.subject_template

            formatted_body = self.template_manager.render_template(
                email_config.template_name, email_data
            )
            return self._send_smtp_email(to_email, subject, formatted_body)

        except Exception as e:
            logging.error(f"Error preparing email {email_type}: {str(e)}")
            return False

    def _validate_required_variables(
        self, email_config: EmailType, data: Dict[str, Any]
    ):
        """Validate that all required variables are provided"""
        missing_vars = [
            var for var in email_config.required_variables if var not in data
        ]
        if missing_vars:
            raise ValueError(f"Missing required variables: {missing_vars}")

    def _send_smtp_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """Send email via SMTP"""
        try:
            message = MIMEMultipart("alternative")
            message["From"] = self.sender_email
            message["To"] = to_email
            message["Subject"] = subject
            message["X-Mailer"] = "W3LL Station Email Service"

            message.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                logging.info("SMTP connection established, starting TLS...")
                server.starttls()
                logging.info("TLS started, attempting login...")
                server.login(self.sender_email, self.sender_password)
                logging.info("Login successful, sending email...")
                response = server.sendmail(
                    self.sender_email, to_email, message.as_string()
                )
                logging.info(f"SMTP response: {response}")
                logging.info(f"Email sent successfully to {to_email}")

            return True

        except Exception as e:
            logging.error(f"Error sending email: {str(e)}")
            return False

    def send_wellbeing_report(self, to_email: str, report_link: str) -> bool:
        """Send wellbeing report email"""
        return self.send_email(
            "wellbeing_report", to_email, {"report_link": report_link}
        )

    def send_pin_reset(self, to_email: str, temp_pin: str) -> bool:
        """Send PIN reset email"""
        has_email_sent = self.send_email("pin_reset", to_email, {"temp_pin": temp_pin})
        if has_email_sent:
            return True
        else:
            raise Exception("Something went wrong")


# Backward compatibility - keep the old function for existing code
def send_email(to_email, subject, data):
    """Legacy function for backward compatibility"""
    service = EmailService()

    if "report_link" in data:
        return service.send_wellbeing_report(to_email, data["report_link"])
    else:
        return service._send_smtp_email(
            to_email,
            subject,
            service.template_manager.render_template("wellbeing_report", data),
        )
