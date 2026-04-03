# RAIN

RAIN is a startup website based on your rainwater collection, processing, and platform idea.

This repo now contains two versions:

- A GitHub Pages-ready static site in `docs/`
- A lightweight Python backend version for local/full-stack use

## Project structure

```text
RAIN/
|-- docs/                  # GitHub Pages deployment version
|   |-- .nojekyll
|   |-- app.js
|   |-- index.html
|   |-- site-data.json
|   `-- styles.css
|-- data/
|   `-- inquiries.json
|-- static/                # frontend used by the local Python server
|   |-- app.js
|   |-- index.html
|   `-- styles.css
|-- server.py              # local backend
`-- README.md
```

## GitHub Pages version

Use the `docs/` folder for GitHub Pages.

Important:

- GitHub Pages cannot run the Python backend
- The Pages site is fully static
- Content is loaded from `docs/site-data.json`
- The contact form uses `mailto:` instead of posting to a backend

Before publishing, replace this placeholder in `docs/site-data.json`:

```json
"email": "set-your-email@example.com"
```

with your real contact email.

## How to publish with GitHub Pages

1. Push this project to your GitHub repository.
2. Open the repository settings on GitHub.
3. Go to `Pages`.
4. Under source, choose `Deploy from a branch`.
5. Select your main branch.
6. Select `/docs` as the folder.
7. Save.

After that, GitHub Pages will publish the website from `docs/`.

## Local full-stack version

If you want to run the backend locally:

```powershell
py server.py
```

Then open:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

## Local API endpoints

- `GET /api/site-data`
- `GET /api/health`
- `POST /api/contact`

## Notes

- The GitHub Pages version is the right one for your repository deployment.
- The Python backend version is still useful if you later deploy to Render, Railway, or another backend host.
- This project uses only Python standard library modules, so local backend setup does not need `pip install`.
