import { useState } from "react";
import axios from "axios";

export default function DemographicsForm() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!address.trim()) {
      setError("Please enter a property address.");
      return;
    }

    setError(null);
    setData(null);
    setLoading(true);

    try {
      const API_BASE =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

      const res = await axios.get(
        `${API_BASE}/api/demographics?address=${encodeURIComponent(address)}`
      );

      if (res.data?.error) {
        setError(res.data.error);
      } else {
        setData(res.data);
      }
    } catch {
      setError("Failed to fetch demographics. Please check your address and try again.");
    } finally {
      setLoading(false);
    }
  };

  const rows = [
    "White",
    "Black or African American",
    "Hispanic or Latino",
    "Asian",
    "American Indian or Alaska Native",
    "Native Hawaiian or Pacific Islander",
    // include these only if you add them in backend:
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 border-t-8 border-blue-700">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2 text-center">
          🗽HOUSES 4 US🗽
        </h1>
        <h1 className="text-2xl font-extrabold text-blue-900 mb-2 text-center">
          CITY OF JERSEY CITY DEPARTMENT OF HOUSING, ECONOMIC DEVELOPMENT AND COMMERCE DIVISION OF AFFORDABLE HOUSING
        </h1>
        <h1 className="text-1xl font-extrabold text-blue-900 mb-2 text-center">
          AFFIRMATIVE FAIR HOUSING MARKETING PLAN - SECTION 4A
        </h1>
        <p className="text-gray-700 mb-6 text-center">
          Enter a property address to generate Census Tract + ACS demographics for <strong><u>2024</u></strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="e.g., 829 Garfield Avenue, Jersey City, NJ 07305"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 border border-gray-300 p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded shadow-md transition-all duration-200 disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        <div className="text-xs text-gray-500">
          Tip: If it can’t find a tract, add ZIP code (ex: 07302 / 07305).
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
            <div className="font-semibold">Couldn’t generate results</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}

        {data && (
          <div className="mt-6">
            {/* Census Tract Display */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-900 border border-blue-200">
                <span className="text-lg">📍</span>
                <span className="font-semibold">Census Tract:</span>
                <span className="font-bold">{data["Census Tract"]}</span>
              </div>

              {data["GEOID"] && (
                <div className="text-sm text-gray-600">
                  GEOID: <span className="font-mono">{data["GEOID"]}</span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                <thead className="bg-blue-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Demographic</th>
                    <th className="px-4 py-3 text-left">Population</th>
                    <th className="px-4 py-3 text-left">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((key) => (
                    <tr
                      key={key}
                      className="border-b border-gray-200 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">{key}</td>
                      <td className="px-4 py-2">{data[key] ?? "-"}</td>
                      <td className="px-4 py-2">{data[`${key} %`] ?? "-"}%</td>
                    </tr>
                  ))}

                  <tr className="bg-gray-100 font-bold">
                    <td className="px-4 py-2">Total Population</td>
                    <td className="px-4 py-2">{data["Total Population"]}</td>
                    <td className="px-4 py-2">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}