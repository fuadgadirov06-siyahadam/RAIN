# RAIN

RAIN is a lightweight full-stack startup website built from your rainwater infrastructure concept.
It includes:

- A Python backend with JSON API endpoints
- A dynamic frontend in English
- A working inquiry form that stores submissions locally

## Project structure

```text
RAIN/
|-- server.py
|-- data/
|   `-- inquiries.json
`-- static/
    |-- app.js
    |-- index.html
    `-- styles.css
```

## Features

- Startup landing page for the RAIN brand
- Product story based on the three-layer model:
  - Collection Layer
  - Processing Layer
  - RaaS Platform
- Sector pages presented as homepage sections:
  - Construction
  - Agriculture
  - Industry
  - Municipalities
- Revenue model explanation
- Live backend health check
- Contact form that saves inquiries into `data/inquiries.json`

## Run locally

From `D:\Carier\RAIN`:

```powershell
py server.py
```

Then open:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

## API endpoints

- `GET /api/site-data` returns all content rendered by the frontend
- `GET /api/health` returns server health and inquiry count
- `POST /api/contact` accepts inquiry submissions and stores them locally

## Notes

- This project uses only Python standard library modules, so it does not require `pip install`.
- Inquiry data is stored locally for now. If you want, the next step can be adding:
  - SQLite storage
  - admin dashboard
  - email notifications
  - multi-page routing
