from datetime import datetime

def is_reminder_due(scheduled_date, scheduled_time):
    scheduled_datetime_str = f"{scheduled_date} {scheduled_time}"

    scheduled_datetime = datetime.strptime(
        scheduled_datetime_str,
        "%Y-%m-%d %H:%M"
    )

    current_datetime = datetime.now()

    return scheduled_datetime <= current_datetime