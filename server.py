from email.message import EmailMessage
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs
import html
import os
import smtplib

BASE_DIR = Path(__file__).resolve().parent
MAIL_TO = os.environ.get("MAIL_TO", "editorsforyouagency@gmail.com").strip()
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587").strip())
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip().replace(" ", "")
MAIL_FROM = os.environ.get("MAIL_FROM", SMTP_USERNAME or MAIL_TO).strip()


class EditorsForYouHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_POST(self):
        if self.path.rstrip("/") not in ("/contact", "/api/contact"):
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")
            return

        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length).decode("utf-8", errors="replace")
        form = {key: values[0].strip() for key, values in parse_qs(raw_body).items()}

        name = form.get("name", "")
        email = form.get("email", "")
        phone = form.get("phone", "")
        category = form.get("category", "")
        subcategory = form.get("subcategory", "")
        tier = form.get("tier", "")
        duration = form.get("duration", "")
        pricing_base = form.get("pricing_base", "")
        discount = form.get("discount", "")
        calculated_price = form.get("calculated_price", "")
        project = form.get("message", "") or form.get("project", "")

        if not name or not email:
            self.send_error(HTTPStatus.BAD_REQUEST, "Name and email are required")
            return

        try:
            send_contact_email(name, email, phone, category, subcategory, tier, duration, pricing_base, discount, calculated_price, project)
        except smtplib.SMTPAuthenticationError:
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(render_error(gmail_auth_message()).encode("utf-8"))
            return
        except Exception:
            self.send_response(HTTPStatus.INTERNAL_SERVER_ERROR)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(
                render_error("The message could not be sent right now. Please try again later.").encode("utf-8")
            )
            return

        self.send_response(HTTPStatus.SEE_OTHER)
        self.send_header("Location", "/thankyou.html")
        self.end_headers()


def send_contact_email(name, email, phone, category, subcategory, tier, duration, pricing_base, discount, calculated_price, project):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_USERNAME and SMTP_PASSWORD are not set. Use an app password for Gmail."
        )

    message = EmailMessage()
    message["Subject"] = "New Editors For You Client"
    message["From"] = MAIL_FROM
    message["To"] = MAIL_TO
    message["Reply-To"] = email
    message.set_content(
        f"New project enquiry from Editors For You website\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Phone: {phone or 'Not provided'}\n"
        f"Category: {category or 'Not selected'}\n"
        f"Sub-category: {subcategory or 'Not selected'}\n"
        f"Tier: {tier or 'Not selected'}\n"
        f"Duration: {duration or 'Not provided'}\n"
        f"Pricing base: {pricing_base or 'Not provided'}\n"
        f"Discount: {discount or '0'}\n"
        f"Calculated price: {calculated_price or 'Not calculated'}\n\n"
        f"Project details:\n{project or 'Not provided'}\n"
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)


def gmail_auth_message():
    return (
        "Gmail rejected the SMTP login. Set SMTP_USERNAME to the Gmail address "
        "and SMTP_PASSWORD to a Google app password, not your normal Gmail password. "
        "After changing environment variables, restart or redeploy the site."
    )


def render_error(message):
    details = html.escape(str(message))
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Submission Error</title>
<style>
body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#050505;color:white;font-family:Arial,sans-serif;padding:24px}}
main{{max-width:620px;background:rgba(20,20,20,.85);border:1px solid rgba(26,255,122,.12);border-radius:22px;padding:34px}}
h1{{color:#1aff7a;font-size:2rem;margin:0 0 14px}}
p{{color:#ccc;line-height:1.6}}
a{{color:#1aff7a}}
code{{color:#fff}}
</style>
</head>
<body>
<main>
<h1>Could not send message</h1>
<p>{details}</p>
<p>Check your SMTP environment variables, then try again.</p>
<p><a href="/contact.html">Back to contact form</a></p>
</main>
</body>
</html>
"""


if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), EditorsForYouHandler)
    print(f"Editors For You site running at http://{host}:{port}")
    print("Press Ctrl+C to stop.")
    server.serve_forever()
