import smtplib
from email.message import EmailMessage
from src.config import EMAIL_ADDRESS, EMAIL_PASSWORD, SMTP_SERVER, SMTP_PORT, DRY_RUN

def send_email(to_email, subject, body, logger):
    try:
        if DRY_RUN:
            logger.info(f"DRY RUN: Email prepared for {to_email}")
            return {
                "status": "DRY_RUN_SUCCESS",
                "error": ""
            }

        message = EmailMessage()
        message["From"] = EMAIL_ADDRESS
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.send_message(message)

        logger.info(f"Email sent successfully to {to_email}")

        return {
            "status": "SENT",
            "error": ""
        }

    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")

        return {
            "status": "FAILED",
            "error": str(e)
        }