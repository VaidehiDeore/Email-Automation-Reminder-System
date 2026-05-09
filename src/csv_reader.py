import pandas as pd

def read_contacts(file_path="data/contacts.csv"):
    try:
        contacts = pd.read_csv(file_path)
        required_columns = ["name", "email", "company", "role", "event"]

        for column in required_columns:
            if column not in contacts.columns:
                raise ValueError(f"Missing column in contacts CSV: {column}")

        return contacts

    except Exception as e:
        raise Exception(f"Error reading contacts file: {e}")


def read_reminders(file_path="data/reminders.csv"):
    try:
        reminders = pd.read_csv(file_path)
        required_columns = [
            "reminder_id",
            "title",
            "subject",
            "scheduled_date",
            "scheduled_time",
            "template_name"
        ]

        for column in required_columns:
            if column not in reminders.columns:
                raise ValueError(f"Missing column in reminders CSV: {column}")

        return reminders

    except Exception as e:
        raise Exception(f"Error reading reminders file: {e}")