from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Enable CORS for frontend (React) during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/demographics")
def get_demographics(address: str = Query(..., description="Full property address")):
    """
    Given a property address, returns Census Tract and basic ACS 2022 demographics.
    """

    # Auto-append Jersey City, NJ if missing
    if "jersey city" not in address.lower():
        address += ", Jersey City, NJ"

    # 1️⃣ Get Census Tract from Census Geocoder
    geocode_url = (
        "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?"
        f"address={requests.utils.quote(address)}"
        "&benchmark=Public_AR_Current"
        "&vintage=Current_Current"
        "&format=json"
    )

    try:
        geocode_res = requests.get(geocode_url, timeout=10)
        geocode_res.raise_for_status()
    except requests.RequestException as e:
        return {"error": f"Failed to contact Census Geocoder: {str(e)}"}

    try:
        matches = geocode_res.json()["result"]["addressMatches"]
        if not matches:
            return {"error": "Could not determine Census Tract. Check address or include ZIP code."}
        tract_info = matches[0]["geographies"]["Census Tracts"][0]
        census_tract = tract_info["TRACT"]
        tract_geoid = tract_info["GEOID"]
    except (KeyError, IndexError, ValueError):
        return {"error": "Census Tract not found in geocoder response."}

    # Fetch ACS 2022 demographic data
    # Example variables for basic race demographics (you can expand)
    acs_vars = [
        "B02001_002E",  # White
        "B02001_003E",  # Black or African American
        "B03003_003E",  # Hispanic or Latino
        "B02001_005E",  # Asian
        "B02001_004E",  # American Indian/Alaska Native
        "B02001_006E",  # Native Hawaiian/Pacific Islander
        "B01001_001E",  # Total population
    ]
    vars_str = ",".join(acs_vars)

    acs_url = (
        f"https://api.census.gov/data/2022/acs/acs5?get={vars_str}&for=tract:{census_tract}&in=state:34+county:017"
    )

    try:
        acs_res = requests.get(acs_url, timeout=10)
        acs_res.raise_for_status()
        acs_json = acs_res.json()
        # acs_json[0] = headers, acs_json[1] = values
        headers, values = acs_json
        acs_data = dict(zip(headers, values))
    except requests.RequestException as e:
        return {"error": f"Failed to fetch ACS data: {str(e)}"}
    except (ValueError, IndexError):
        return {"error": "ACS API returned invalid response."}

    # Format data for frontend
    demographics = {
        "Census Tract": census_tract,
        "GEOID": tract_geoid,
        "White": int(acs_data.get("B02001_002E", 0)),
        "Black or African American": int(acs_data.get("B02001_003E", 0)),
        "Hispanic or Latino": int(acs_data.get("B03003_003E", 0)),
        "Asian": int(acs_data.get("B02001_005E", 0)),
        "American Indian or Alaska Native": int(acs_data.get("B02001_004E", 0)),
        "Native Hawaiian or Pacific Islander": int(acs_data.get("B02001_006E", 0)),
        "Total Population": int(acs_data.get("B01001_001E", 0)),
    }

    # Calculate percentages
    for key in ["White", "Black or African American", "Hispanic or Latino", "Asian", "American Indian or Alaska Native", "Native Hawaiian or Pacific Islander"]:
        demographics[f"{key} %"] = round((demographics[key] / demographics["Total Population"]) * 100, 1) if demographics["Total Population"] else 0

    # Add "Other" and "Other %"
    known_keys = [
        "White",
        "Black or African American",
        "Hispanic or Latino",
        "Asian",
        "American Indian or Alaska Native",
        "Native Hawaiian or Pacific Islander",
    ]

    known_sum = sum(demographics[k] for k in known_keys)

    demographics["Other"] = max(
        demographics["Total Population"] - known_sum,
        0
    )

    demographics["Other %"] = round(
        (demographics["Other"] / demographics["Total Population"]) * 100,
        1
    ) if demographics["Total Population"] else 0

    return demographics