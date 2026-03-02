import { useState } from "react";
import axios from "axios";

export default function DemographicsForm() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!address) {
      setError("Please enter a property address.");
      return;
    }

    setError(null);
    setData(null);
    setLoading(true);

    try {
      const res = await axios.get(`/api/demographics?address=${encodeURIComponent(address)}`);
      if (res.data.error) {
        // Detect geocoder failure specifically
        if (res.data.error.includes("Could not determine Census Tract")) {
          setError(
            "Could not determine Census Tract. Try adding ZIP code or ensuring the address includes street number, street name, city, and state (e.g., 140 Bay Street, Jersey City, NJ 07302)."
          );
        } else {
          setError(res.data.error);
        }
      } else {
        setData(res.data);
      }
    } catch (err) {
      setError("Failed to fetch demographics. Please check your address and try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-8 border-t-8 border-blue-700">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">
          🗽CITY OF JERSEY CITY🗽
        </h1>
        <h1 className="text-2xl font-extrabold text-blue-900 mb-6 text-center">
          DEPARTMENT OF HOUSING, ECONOMIC DEVELOPMENT AND COMMERCE DIVISON OF AFFORDABLE HOUSING
        </h1>
         <h1 className="text-1xl font-extrabold text-blue-900 mb-6 text-center">
          AFFIRMATIVE FAIR HOUSING MARKETING PLAN -- SECTION 4A
        </h1>
        <p className="text-gray-700 mb-4 text-center">
          Enter a property address to generate demographic information for the census tract of any given address.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Enter property address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="flex-1 border border-gray-300 p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded shadow-md transition-all duration-200"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 font-semibold mb-4">
            {error}
          </p>
        )}

        {data && (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Demographic</th>
                  <th className="px-4 py-3 text-left">Population</th>
                  <th className="px-4 py-3 text-left">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {["White","Black or African American","Hispanic or Latino","Asian","American Indian or Alaska Native","Native Hawaiian or Pacific Islander","Other"].map(key => (
                  <tr key={key} className="border-b border-gray-200 hover:bg-blue-50 transition">
                    <td className="px-4 py-2 font-medium text-gray-800">{key}</td>
                    <td className="px-4 py-2">{data[key]}</td>
                    <td className="px-4 py-2">{data[`${key} %`]}%</td>
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
        )}
      </div>
    </div>
  );
}