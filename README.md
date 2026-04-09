# RAIN

RAIN is a startup website based on your rainwater collection, processing, and platform idea.

This repo now contains two usable versions:

- A GitHub Pages-ready static site in the repo root
- A lightweight Python backend version for local/full-stack use

## Project structure

```text
RAIN/
|-- docs/                  # backup copy of the static Pages build
|   |-- .nojekyll
|   |-- site.js
|   |-- index.html
|   |-- solutions.html
|   |-- platform.html
|   |-- contact.html
|   |-- portal.html
|   |-- site-data.json
|   `-- site.css
|-- .nojekyll
|-- 404.html
|-- data/
|   `-- inquiries.json
|-- index.html            # GitHub Pages entry file
|-- solutions.html
|-- platform.html
|-- contact.html
|-- portal.html
|-- site.js
|-- site-data.json
|-- static/                # frontend used by the local Python server
|   |-- app.js
|   |-- index.html
|   `-- styles.css
|-- site.css
|-- server.py              # local backend
`-- README.md
```

## GitHub Pages version

Use the repo root for GitHub Pages.

Important:

- GitHub Pages cannot run the Python backend
- The Pages site is fully static
- Content is loaded from `site-data.json`
- The contact form and portal use client-side interactive demo logic suitable for static hosting

## How to publish with GitHub Pages

1. Push this project to your GitHub repository.
2. Open the repository settings on GitHub.
3. Go to `Pages`.
4. Under source, choose `Deploy from a branch`.
5. Select your main branch.
6. Select `/ (root)` as the folder.
7. Save.

After that, GitHub Pages will publish the website directly from the repo root.

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
