import os
import json
import pandas as pd
import numpy as np
from io import BytesIO
from datetime import datetime
from dateutil import parser as date_parser
from rapidfuzz import fuzz, process
import joblib

# ----------------------------
# Configuration & Loading
# ----------------------------

BASE_PATH        = os.path.expanduser('~/Documents')
OVERRIDES_FILE   = os.path.join(BASE_PATH, 'overrides.json')
ML_MODEL_FILE    = os.path.join(BASE_PATH, 'model.joblib')
VECTORIZER_FILE  = os.path.join(BASE_PATH, 'vectorizer.joblib')

# Load overrides
try:
    with open(OVERRIDES_FILE) as f:
        override_map = json.load(f)
except:
    override_map = {}

# Load ML model & vectorizer if present
if os.path.exists(ML_MODEL_FILE) and os.path.exists(VECTORIZER_FILE):
    clf = joblib.load(ML_MODEL_FILE)
    vec = joblib.load(VECTORIZER_FILE)
else:
    clf = vec = None

# Keyword and MCC maps
CATEGORY_KEYWORDS = {
    'Groceries':        ['supermarket','grocery','almaya','carrefour','spinneys'],
    'Transport':        ['uber','taxi','transport','metro','bus','toll','petrol','fuel','careem','arabia taxi'],
    'Dining':           ['restaurant','cafe','coffee','mcdonald','burger','diner','pizza','osteria','trattoria','nonna'],
    'Entertainment':    ['netflix','hulu','spotify','cinema','movie','concert','youtube','premium'],
    'Utilities':        ['electricity','water','gas','internet','du','etisalat','vodafone'],
    'Healthcare':       ['clinic','hospital','pharmacy','medic','lab','insurance','dr.','rx'],
    'Shopping':         ['amazon','noon','mall','zara','hm','electronics','gift','souq','homecentre'],
    'Subscriptions':    ['subscription','membership','gym','adobe','office365'],
    'Travel':           ['booking.com','airbnb','hotel','emirates','flydubai','visa'],
    'Education':        ['udemy','coursera','tuition','school','university','bookstore'],
    'Personal Care':    ['salon','barber','spa','beauty','haircut','nails'],
    'Fees & Charges':   ['fee','atm','service charge','penalty','interest'],
    'Gifts & Donations':['donation','charity','zakat','fundraiser'],
}
MCC_MAP = {
    '5411': 'Groceries', '5812': 'Dining', '5814': 'Dining', '5541': 'Transport',
    '4814': 'Utilities', '5137': 'Shopping', '7299': 'Personal Care',
}
FUZZY_THRESHOLD = 60

# Field synonyms
FIELD_SYNONYMS = {
    'date':        ['date', 'transaction date', 'post date', 'value date', 'date posted'],
    'amount':      ['amount', 'debit amount', 'credit amount', 'transaction amount', 'value'],
    'description': [
        'description', 'details', 'transaction details', 'narrative',
        'remark', 'memo', 'narration', 'remarks', 'transaction remark'
    ],
    'mcc':         ['mcc', 'merchant category code']
}

# ----------------------------
# Helpers
# ----------------------------

def choose_category(desc: str, mcc: str = None) -> str:
    d = str(desc).lower().strip()
    if d in override_map:
        return override_map[d]
    if mcc in MCC_MAP:
        return MCC_MAP[mcc]
    # keyword-based fuzzy match
    best_cat, best_score = 'Other', 0
    for cat, kws in CATEGORY_KEYWORDS.items():
        for kw in kws:
            score = fuzz.partial_ratio(d, kw)
            if score > best_score:
                best_cat, best_score = cat, score
    if best_score >= FUZZY_THRESHOLD:
        return best_cat
    # ML fallback
    if clf and vec:
        pred = clf.predict(vec.transform([d]))[0]
        if pred in CATEGORY_KEYWORDS or pred == 'Other':
            return pred
    return 'Other'

def fuzzy_find_header(headers: list[str], synonyms: list[str]) -> str | None:
    """
    Given a list of column headers and a list of synonyms,
    return the best matching header above threshold, or None.
    """
    match, score, _ = process.extractOne(
        query=synonyms,
        choices=headers,
        scorer=fuzz.token_sort_ratio
    )
    return match if score >= FUZZY_THRESHOLD else None

def detect_header_row(buf: BytesIO, ext: str, max_rows: int = 10) -> int:
    """
    Scan the first `max_rows` lines to find the row index
    where date, amount, and description headers co-occur.
    Returns the number of rows to skip.
    """
    for skip in range(max_rows):
        try:
            df = pd.read_csv(buf, dtype=str, skiprows=skip, nrows=0)
            cols = [c.strip() for c in df.columns]
            low = {c.lower() for c in cols}
            if {'date','amount'}.issubset(low) and {'description','details'}.intersection(low):
                return skip
        except:
            pass
        buf.seek(0)
    return 0

# ----------------------------
# Main Import Function
# ----------------------------

def import_transactions(source, filename: str) -> pd.DataFrame:
    """
    Load a file (bytes or file path) into a DataFrame, normalize columns,
    parse dates & amounts, and categorize transactions.
    """
    ext = os.path.splitext(filename)[1].lower()
    buf = BytesIO(source) if isinstance(source, (bytes, bytearray)) else open(source, 'rb')

    # 1) Read raw DataFrame
    if ext == '.csv':
        buf.seek(0)
        skip = detect_header_row(buf, ext)
        buf.seek(0)
        df = pd.read_csv(buf, dtype=str, skiprows=skip)
    elif ext in ('.xls', '.xlsx'):
        buf.seek(0)
        df = pd.read_excel(buf, engine='openpyxl', dtype=str)
    elif ext == '.json':
        buf.seek(0)
        df = pd.read_json(buf, dtype=str)
    else:
        raise ValueError(f"Unsupported extension '{ext}'")

    # Trim column whitespace and capture headers
    df.columns = [c.strip() for c in df.columns]
    headers = list(df.columns)

    # 2) Rename via fuzzy + synonyms
    mapping = {}
    for field, syns in FIELD_SYNONYMS.items():
        if match := fuzzy_find_header(headers, syns):
            mapping[field.capitalize()] = match
    df = df.rename(columns=mapping)

    # 3) Ensure required columns
    needed = ['Date', 'Amount', 'Description']
    missing = [f for f in needed if f not in df.columns]
    if 'Description' not in df.columns and (others := [c for c in df.columns if c not in ('Date','Amount')]):
        df = df.rename(columns={others[0]: 'Description'})
        missing = [f for f in needed if f not in df.columns]
    if missing:
        raise KeyError(f"Missing required columns: {missing} in '{filename}'")

    # 4) Parse & clean
    df['Date']   = df['Date'].apply(date_parser.parse)
    df['Amount'] = (df['Amount']
                    .str.replace(',', '')
                    .str.replace(r'[\(\)]', '', regex=True)
                    .astype(float))

    # 5) Categorize
    df['Category']     = df.apply(lambda r: choose_category(
                              r['Description'], r.get('Mcc') or r.get('MCC')), axis=1)
    df['OrigCategory'] = df['Category']

    return df