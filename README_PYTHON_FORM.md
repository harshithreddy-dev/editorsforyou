# Python Contact Form Backend

This replaces FormSubmit with `server.py`, a small Python server that:

- serves your existing HTML files
- accepts the contact form at `/contact`
- sends the form details to your email through SMTP
- redirects users to `thankyou.html`

## Gmail Setup

Use a Gmail app password, not your normal Gmail password.

1. Turn on 2-Step Verification for the Gmail account.
2. Create an app password from Google Account > Security > App passwords.
3. Use that app password as `SMTP_PASSWORD`.

## Run Locally On Windows PowerShell

```powershell
cd "C:\Users\harsh\OneDrive\Desktop\editorsforyou\final_web"
$env:SMTP_USERNAME="editorsforyouagency@gmail.com"
$env:SMTP_PASSWORD="your-gmail-app-password"
$env:MAIL_TO="editorsforyouagency@gmail.com"
python server.py
```

Open:

```text
http://127.0.0.1:8000/contact.html
```

## Optional SMTP Settings

Defaults are already set for Gmail:

```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
```

## Important

The form will only work when the site is opened through the Python server URL, not by double-clicking `contact.html` directly. If you deploy the site online, the host must support running Python, such as a VPS, Render, Railway, or similar backend hosting.