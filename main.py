from datetime import datetime

from src.csv_reader import read_contacts, read_reminders
from src.template_engine import load_template, personalize_email
from src.email_sender import send_email
from src.report_generator import generate_report
from src.logger_setup import setup_logger
from src.scheduler import is_reminder_due
from src.config import DRY_RUN


def main():
    logger = setup_logger()

    print("=" * 60)
    print("EMAIL AUTOMATION & REMINDER SYSTEM")
    print("=" * 60)

    if DRY_RUN:
        print("Mode: DRY RUN")
        print("No real emails will be sent.")
    else:
        print("Mode: ACTUAL EMAIL SENDING")

    print("-" * 60)

    try:
        logger.info("System started")

        contacts = read_contacts()
        reminders = read_reminders()

        print(f"[INFO] Contacts loaded: {len(contacts)}")
        print(f"[INFO] Reminders loaded: {len(reminders)}")

        logger.info(f"Loaded {len(contacts)} contacts")
        logger.info(f"Loaded {len(reminders)} reminders")

        report_records = []

        for _, reminder in reminders.iterrows():
            due = is_reminder_due(
                reminder["scheduled_date"],
                reminder["scheduled_time"]
            )

            if not due:
                print(f"[PENDING] Reminder not due yet: {reminder['title']}")
                continue

            print(f"[DUE] Processing reminder: {reminder['title']}")

            template = load_template(reminder["template_name"])

            for _, contact in contacts.iterrows():
                email_body = personalize_email(template, contact)

                result = send_email(
                    to_email=contact["email"],
                    subject=reminder["subject"],
                    body=email_body,
                    logger=logger
                )

                record = {
                    "recipient_name": contact["name"],
                    "email": contact["email"],
                    "company": contact["company"],
                    "role": contact["role"],
                    "event": contact["event"],
                    "reminder_title": reminder["title"],
                    "subject": reminder["subject"],
                    "scheduled_date": reminder["scheduled_date"],
                    "scheduled_time": reminder["scheduled_time"],
                    "status": result["status"],
                    "error": result["error"],
                    "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }

                report_records.append(record)

                print(f"[{result['status']}] {contact['email']}")

        if report_records:
            report_path = generate_report(report_records)
            print("-" * 60)
            print(f"[INFO] Report generated: {report_path}")
            logger.info(f"Report generated: {report_path}")
        else:
            print("[INFO] No due reminders found. No report generated.")
            logger.info("No due reminders found")

        print("=" * 60)
        print("PROCESS COMPLETED")
        print("=" * 60)

        logger.info("System completed successfully")

    except Exception as e:
        print(f"[ERROR] {e}")
        logger.error(f"System error: {e}")


if __name__ == "__main__":
    main()