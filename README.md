# 🏠 Houses4Us

**Affirmative Fair Housing Marketing Plan (AFHMP) — Section 4a Demographic Automation**

> Automates demographic data collection for the Jersey City Division of Affordable Housing's AFHMP form. Given a property address, Houses4Us derives the Census Tract and pulls live ACS data from the U.S. Census Bureau — then exports a pre-filled AFHMP Section 4a table as Word, PDF, or Excel.

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/get-started) & Docker Compose
- Internet connection (calls the Census Bureau APIs)

### Run

```bash
git clone <repo-url>
cd houses4us

# Optional: add a free Census API key for higher rate limits
cp .env.example .env
# edit .env and add your CENSUS_API_KEY

docker compose up --build
```

Then open **http://localhost:3000** in your browser.

---

## 🗺️ How It Works

```
User enters address
       ↓
Census Geocoder API
(geocoding.geo.census.gov)
       ↓
   State FIPS + County FIPS + Census Tract
       ↓
ACS 5-Year Estimates API
(api.census.gov)
   ├── B02001: Race (White, Black, Asian, AIAN, NHOPI)
   ├── B03003: Hispanic or Latino
   ├── B18101: Persons with Disabilities
   └── B11003: Families with Children under 18
       ↓
Section 4a Dashboard
       ↓
Export: DOCX / PDF / Excel
```

---

## 📋 Section 4a — What Gets Filled

The following demographic groups are auto-populated for the census tract:

| Demographic | ACS Variable |
|---|---|
| White | B02001_002E |
| Black or African American | B02001_003E |
| Hispanic or Latino | B03003_003E |
| Asian | B02001_005E |
| American Indian or Alaskan Native | B02001_004E |
| Native Hawaiian or Pacific Islander | B02001_006E |
| Persons with Disabilities | B18101 (summed) |
| Families with Children under 18 | B11003 (summed) |
| Other | B02001_007E + B02001_008E |

---

## 📁 Project Structure

```
houses4us/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app
│   │   ├── routers/
│   │   │   ├── geocode.py             # Address → Census Tract
│   │   │   ├── demographics.py        # ACS data fetcher
│   │   │   └── export.py              # DOCX / PDF / Excel export
│   │   └── services/
│   │       ├── census_geocoder.py     # Census Geocoder API
│   │       ├── census_acs.py          # ACS 5-Year data
│   │       ├── docx_generator.py      # Word document builder
│   │       ├── excel_generator.py     # Excel workbook builder
│   │       └── pdf_generator.py       # PDF report builder
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx           # Address input
│   │   │   └── DashboardPage.jsx      # Demographics + exports
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── nginx.conf                     # Production proxy config
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/geocode` | Address → Census Tract + FIPS |
| POST | `/api/v1/demographics` | Census Tract → ACS Demographics |
| POST | `/api/v1/export/docx` | Generate AFHMP Word document |
| POST | `/api/v1/export/excel` | Generate Excel workbook with chart |
| POST | `/api/v1/export/pdf` | Generate PDF report |
| GET | `/health` | Health check |

Interactive API docs: **http://localhost:8000/docs**

---

## 🔑 Census API Key

The Census Bureau APIs work **without a key** at low usage volumes. For production or frequent use, get a free key:

1. Visit https://api.census.gov/data/key_signup.html
2. Add `CENSUS_API_KEY=your_key` to your `.env` file
3. Restart: `docker compose restart backend`

---

## 🏙️ About

Built for **Quetzal Consulting, LLC** to automate AFHMP Section 4a preparation for the **Jersey City Division of Affordable Housing (DOAH)**, in compliance with Jersey City Ordinance Chapter 188 and applicable HUD guidelines.

**Tech Stack:** FastAPI · React · ReportLab · python-docx · openpyxl · Docker
**Data Source:** U.S. Census Bureau ACS 5-Year Estimates
