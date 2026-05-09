def load_template(template_name):
    try:
        path = f"templates/{template_name}"

        with open(path, "r", encoding="utf-8") as file:
            return file.read()

    except Exception as e:
        raise Exception(f"Error loading template: {e}")


def personalize_email(template, contact):
    try:
        personalized_message = template.format(
            name=contact["name"],
            email=contact["email"],
            company=contact["company"],
            role=contact["role"],
            event=contact["event"]
        )

        return personalized_message

    except KeyError as e:
        raise Exception(f"Missing placeholder value: {e}")