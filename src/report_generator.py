import pandas as pd
import os
from datetime import datetime

def generate_report(records):
    os.makedirs("outputs", exist_ok=True)

    report_df = pd.DataFrame(records)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = f"outputs/email_report_{timestamp}.csv"

    report_df.to_csv(report_path, index=False)

    return report_path