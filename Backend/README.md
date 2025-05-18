# FastAPI Finance Tracker

A simple Flask-to-FastAPI migration of a personal finance app that:

- Imports CSV transactions
- Auto-categorizes them (keyword + ML + override)
- Stores users & transactions in SQLite
- Provides summary & detail views via Jinja2 templates

## Features

- **User registration & login** (cookie-based sessions)  
- **CSV upload** & parsing with Pandas  
- **Category overrides** persisted to JSON & DB  
- **Summary dashboard**: total spend by category  
- **Detail view**: per-category transaction list + override form  
- **Automatic docs** at `/docs` (Swagger UI)

## Tech Stack

- **FastAPI** + Uvicorn (ASGI)  
- **SQLAlchemy** ORM + SQLite  
- **Pandas** & **RapidFuzz** for import & categorization  
- **Jinja2** templates for HTML views  
- **Passlib** (bcrypt) for password hashing  
- **Joblib** for loading optional ML model/vectorizer

## Getting Started

### Prerequisites

- Python 3.10+  
- `git`, `virtualenv` (or `venv`)

### Installation

```bash
git clone <your-repo-URL>
cd fastapi_project
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Configuration

- By default it uses `sqlite:///./fin.db`.  
- Overrides JSON, ML model, and vectorizer are loaded from `~/Documents/overrides.json`, `model.joblib` and `vectorizer.joblib` — adjust paths in `app/categorize.py` if needed.

### Running

```bash
uvicorn app.main:app --reload
```

- App will be available at `http://127.0.0.1:8000/`  
- API docs: `http://127.0.0.1:8000/docs`

## Project Structure

```
.
├── app/
│   ├── db.py
│   ├── models.py
│   ├── categorize.py
│   ├── routers/
│   │   ├── auth.py
│   │   └── transactions.py
│   └── main.py
├── templates/
│   ├── layout.html
│   ├── register.html
│   ├── login.html
│   ├── upload.html
│   ├── summary.html
│   └── details.html
├── requirements.txt
└── README.md
```

## Usage

1. Register a new user  
2. Log in  
3. Upload your bank CSV  
4. View summary & drill down on categories  
5. Override any mis-categorized transaction

## License

MIT © Your Name
