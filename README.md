# Houses4Us

Automate Section 4a of the Affirmative Fair Housing Marketing Plan for Jersey City affordable housing developments.

Generate Census Tract and demographic data (ACS 5-Year Estimates) from a property address.

https://your-deployment-url.netlify.app/

---

## Stack

- React (Create React App + TailwindCSS) – frontend
- FastAPI – backend
- Python
- U.S. Census Geocoder API
- U.S. Census ACS 5-Year API
- Vercel (deployment target)

---

## Run Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Mac/Linux
# OR venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn main:app --reload
```

---

### Frontend
```bash
cd frontend
npm install
npm start
```

---

API

POST /api/demographics

Generate Census Tract and demographic data fro a given address.

Query Parameter:
```Code
address=Full property address
```

Example:
```Code
GET /api/demographics?address=829 Garfield Avenue, Jersey City, NJ 07305
```

Response:
```JSON
{
  "Census Tract": "004500",
  "GEOID": "34017004500",
  "White": 1234,
  "White %": 45.3,
  "Black or African American": 567,
  "Black or African American %": 20.8,
  "Hispanic or Latino": 432,
  "Hispanic or Latino %": 15.9,
  "Asian": 321,
  "Asian %": 11.8,
  "American Indian or Alaska Native": 12,
  "American Indian or Alaska Native %": 0.4,
  "Native Hawaiian or Pacific Islander": 5,
  "Native Hawaiian or Pacific Islander %": 0.2,
  "Total Population": 2721
}
```

---

License

MIT
