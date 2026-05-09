import os
import glob
import subprocess
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="Email Automation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContactInput(BaseModel):
    name: str
    email: str
    company: str
    role: str
    event: str


class ReminderInput(BaseModel):
    title: str
    subject: str
    scheduled_date: str
    scheduled_time: str
    template_name: str = "reminder_template.txt"


def latest_report():
    files = glob.glob("outputs/email_report_*.csv")
    if not files:
        return None
    return max(files, key=os.path.getctime)


def safe_read_csv(path):
    if path and os.path.exists(path):
        return pd.read_csv(path)
    return pd.DataFrame()


@app.get("/api/dashboard")
def dashboard_data():
    contacts = safe_read_csv("data/contacts.csv")
    reminders = safe_read_csv("data/reminders.csv")

    report_path = latest_report()
    report = safe_read_csv(report_path) if report_path else pd.DataFrame()

    total = len(report)

    if "status" in report.columns:
        successful = len(report[report["status"].isin(["SENT", "DRY_RUN_SUCCESS"])])
        failed = len(report[report["status"] == "FAILED"])
    else:
        successful = 0
        failed = 0

    pending = len(reminders)

    return {
        "summary": {
            "totalEmails": int(total),
            "successful": int(successful),
            "pending": int(pending),
            "failed": int(failed),
        },
        "contacts": contacts.fillna("").to_dict(orient="records"),
        "reminders": reminders.fillna("").to_dict(orient="records"),
        "reports": report.fillna("").to_dict(orient="records"),
    }


@app.post("/api/run-automation")
def run_automation():
    result = subprocess.run(
        ["python", "main.py"],
        capture_output=True,
        text=True,
        shell=True,
    )

    return {
        "message": "Automation executed",
        "output": result.stdout,
        "error": result.stderr,
    }


@app.post("/api/add-contact")
def add_contact(contact: ContactInput):
    path = "data/contacts.csv"

    new_row = pd.DataFrame([contact.model_dump()])

    if os.path.exists(path):
        old_data = pd.read_csv(path)
        updated = pd.concat([old_data, new_row], ignore_index=True)
    else:
        updated = new_row

    updated.to_csv(path, index=False)

    return {"message": "Contact added successfully"}


@app.post("/api/add-reminder")
def add_reminder(reminder: ReminderInput):
    path = "data/reminders.csv"

    if os.path.exists(path):
        old_data = pd.read_csv(path)
        next_id = len(old_data) + 1
    else:
        old_data = pd.DataFrame()
        next_id = 1

    new_row = pd.DataFrame(
        [
            {
                "reminder_id": next_id,
                "title": reminder.title,
                "subject": reminder.subject,
                "scheduled_date": reminder.scheduled_date,
                "scheduled_time": reminder.scheduled_time,
                "template_name": reminder.template_name,
            }
        ]
    )

    updated = pd.concat([old_data, new_row], ignore_index=True)
    updated.to_csv(path, index=False)

    return {"message": "Reminder added successfully"}


@app.get("/api/download-report")
def download_report():
    report_path = latest_report()

    if not report_path:
        return {"message": "No report found"}

    return FileResponse(
        report_path,
        media_type="text/csv",
        filename=os.path.basename(report_path),
    )