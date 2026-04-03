from __future__ import annotations

import json
import re
from datetime import UTC, datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
INQUIRIES_FILE = DATA_DIR / "inquiries.json"

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

SITE_DATA = {
    "company": {
        "name": "RAIN",
        "headline": "Rainwater infrastructure, delivered as a managed service.",
        "tagline": "Harvest, process, certify, and distribute non-potable water with one connected system.",
        "mission": (
            "RAIN turns rooftops and surface runoff into monitored, certified water for construction, "
            "agriculture, industry, and municipalities."
        ),
    },
    "stats": [
        {
            "value": "3",
            "label": "Integrated layers",
            "detail": "Collection, processing, and the RaaS platform.",
        },
        {
            "value": "4",
            "label": "Primary sectors",
            "detail": "Construction, agriculture, industry, and municipalities.",
        },
        {
            "value": "24/7",
            "label": "Live monitoring",
            "detail": "Sensor telemetry, alerts, and water-quality visibility.",
        },
    ],
    "layers": [
        {
            "title": "Collection Layer",
            "stage": "Raw water",
            "summary": "Capture rain where it falls and route it into a measurable supply chain.",
            "features": [
                "Roof catchment and modular collector hardware",
                "Surface flow routing for industrial and urban sites",
                "Sensor-linked intake points",
                "Reservoir feed planning based on rainfall events",
            ],
        },
        {
            "title": "Processing Layer",
            "stage": "Certified water",
            "summary": "Treat harvested water to a reliable non-potable quality standard.",
            "features": [
                "Multi-stage filtration for suspended solids",
                "UV sterilization for stable output quality",
                "Quality sensors for turbidity and operational checks",
                "IoT-enabled reservoir and treatment management",
            ],
        },
        {
            "title": "RaaS Platform",
            "stage": "Revenue-ready operations",
            "summary": "Operate the infrastructure as Water-as-a-Service with digital control and billing.",
            "features": [
                "Customer and partner API access",
                "Order, invoicing, and service workflow automation",
                "Real-time water-quality dashboard",
                "Usage tracking for recurring and volume-based pricing",
            ],
        },
    ],
    "capabilities": [
        {
            "title": "Quality intelligence",
            "copy": "Track collection conditions, processing health, and output quality from one command layer.",
        },
        {
            "title": "Operational automation",
            "copy": "Coordinate collectors, reservoirs, treatment steps, and delivery events without manual spreadsheets.",
        },
        {
            "title": "Commercial engine",
            "copy": "Convert treated rainwater into a billable service with flexible contracts and usage data.",
        },
    ],
    "sectors": [
        {
            "name": "Construction",
            "use_case": "Concrete support and dust suppression",
            "benefit": "Lower freshwater demand on temporary or high-consumption job sites.",
        },
        {
            "name": "Agriculture",
            "use_case": "Irrigation systems",
            "benefit": "Create a more resilient water source for planned irrigation cycles.",
        },
        {
            "name": "Industry",
            "use_case": "Cooling and washing",
            "benefit": "Reduce utility dependency for repetitive non-potable water demand.",
        },
        {
            "name": "Municipalities",
            "use_case": "Parks, landscaping, and street operations",
            "benefit": "Support greener city services with visible sustainability metrics.",
        },
    ],
    "revenue_model": [
        {
            "name": "Subscription plans",
            "detail": "Recurring infrastructure and monitoring contracts for predictable monthly revenue.",
        },
        {
            "name": "Volume pricing",
            "detail": "Usage-based charges for delivered or processed water by consumption tier.",
        },
        {
            "name": "Premium quality tariffs",
            "detail": "Higher-margin service levels for sectors that need tighter monitoring and reporting.",
        },
    ],
    "roadmap": [
        {
            "title": "Capture",
            "copy": "Deploy modular collection hardware on rooftops, surfaces, and storage points.",
        },
        {
            "title": "Treat",
            "copy": "Filter, sterilize, and verify water before it reaches the usable inventory pool.",
        },
        {
            "title": "Monetize",
            "copy": "Sell verified non-potable water through contracts, dashboards, and automated billing.",
        },
    ],
    "faq": [
        {
            "question": "What does RAIN actually sell?",
            "answer": "RAIN sells managed non-potable water capacity: the infrastructure, monitoring, and service layer around harvested rainwater.",
        },
        {
            "question": "Why focus on non-potable applications first?",
            "answer": "Construction, irrigation, cooling, washing, and municipal maintenance can unlock strong demand without the complexity of drinking-water certification.",
        },
        {
            "question": "How is quality tracked?",
            "answer": "The platform combines treatment checkpoints, sensor inputs, and a real-time dashboard so customers can see what is happening inside the system.",
        },
    ],
}


def ensure_data_files() -> None:
    DATA_DIR.mkdir(exist_ok=True)
    if not INQUIRIES_FILE.exists():
        INQUIRIES_FILE.write_text("[]", encoding="utf-8")


def load_inquiries() -> list[dict]:
    ensure_data_files()
    try:
        return json.loads(INQUIRIES_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []


def save_inquiries(items: list[dict]) -> None:
    ensure_data_files()
    INQUIRIES_FILE.write_text(json.dumps(items, indent=2), encoding="utf-8")


def validate_inquiry(payload: dict) -> dict[str, str]:
    errors: dict[str, str] = {}

    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    company = str(payload.get("company", "")).strip()
    message = str(payload.get("message", "")).strip()

    if len(name) < 2:
        errors["name"] = "Please enter your name."
    if not EMAIL_PATTERN.match(email):
        errors["email"] = "Please enter a valid email address."
    if len(company) < 2:
        errors["company"] = "Please enter your company or organization."
    if len(message) < 15:
        errors["message"] = "Please share a few details about your project."

    return errors


class RainRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/site-data":
            self.respond_json(SITE_DATA)
            return

        if parsed.path == "/api/health":
            self.respond_json(
                {
                    "status": "ok",
                    "service": "RAIN backend",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "stored_inquiries": len(load_inquiries()),
                }
            )
            return

        if parsed.path in {"/", "/index.html"}:
            self.path = "/index.html"
            super().do_GET()
            return

        if parsed.path.startswith("/api/"):
            self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")
            return

        if "." not in Path(parsed.path).name:
            self.path = "/index.html"
            super().do_GET()
            return

        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/contact":
            self.handle_contact_submission()
            return

        self.send_error(HTTPStatus.NOT_FOUND, "Endpoint not found")

    def handle_contact_submission(self) -> None:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b""
        content_type = self.headers.get("Content-Type", "")

        try:
            if "application/json" in content_type:
                payload = json.loads(raw_body.decode("utf-8") or "{}")
            elif "application/x-www-form-urlencoded" in content_type:
                payload = {
                    key: values[0] if values else ""
                    for key, values in parse_qs(raw_body.decode("utf-8")).items()
                }
            else:
                payload = json.loads(raw_body.decode("utf-8") or "{}")
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.respond_json(
                {"status": "error", "message": "Invalid request payload."},
                status=HTTPStatus.BAD_REQUEST,
            )
            return

        errors = validate_inquiry(payload)
        if errors:
            self.respond_json(
                {"status": "error", "message": "Please fix the highlighted fields.", "errors": errors},
                status=HTTPStatus.BAD_REQUEST,
            )
            return

        inquiries = load_inquiries()
        inquiry_record = {
            "id": len(inquiries) + 1,
            "name": str(payload.get("name", "")).strip(),
            "email": str(payload.get("email", "")).strip(),
            "company": str(payload.get("company", "")).strip(),
            "sector": str(payload.get("sector", "")).strip(),
            "message": str(payload.get("message", "")).strip(),
            "created_at": datetime.now(UTC).isoformat(),
        }
        inquiries.append(inquiry_record)
        save_inquiries(inquiries)

        self.respond_json(
            {
                "status": "ok",
                "message": "Thanks. Your request has been saved and the RAIN team can follow up from here.",
            },
            status=HTTPStatus.CREATED,
        )

    def respond_json(self, payload: dict, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format: str, *args) -> None:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {self.address_string()} - {format % args}")


def run() -> None:
    ensure_data_files()
    port = 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), RainRequestHandler)
    print(f"RAIN is running at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down RAIN.")
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
