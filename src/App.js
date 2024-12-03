import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [mappings, setMappings] = useState({});
  const [selectedMappingId, setSelectedMappingId] = useState("kekaToDepartment");
  const [tableData, setTableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  // Fetch mappings from the backend
  useEffect(() => {
    axios
      .get("http://localhost:3000/mappings")
      .then((response) => {
        setMappings(response.data);
        setTableData(response.data["kekaToDepartment"] || {}); // Set initial data or empty object if undefined
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching mappings:", error);
        setLoading(false);
      });
  }, []);

  // Handle mapping selection change
  const handleMappingChange = (event) => {
    const selectedId = event.target.value;
    setSelectedMappingId(selectedId);
    setTableData(mappings[selectedId] || {}); // Ensure tableData is updated with a valid object
  };

  // Add new key-value pair to the selected mapping
  const handleAddRow = () => {
    if (!newKey || !newValue) {
      alert("Please fill both Key and Value fields.");
      return;
    }
  
    const userConfirmed = window.confirm(
      `Are you sure you want to add the following row?\n\nKey: ${newKey}\nValue: ${newValue}`
    );
  
    if (userConfirmed) {
      const updatedData = { ...tableData, [newKey]: newValue };
      setTableData(updatedData);
  
      // Send to backend to update DynamoDB
      axios
        .post("http://localhost:3000/mappings/add", {
          mappingId: selectedMappingId,
          key: newKey,
          value: newValue,
        })
        .then((response) => {
          console.log("Data added successfully", response.data);
        })
        .catch((error) => {
          console.error("Error adding data:", error);
        });
  
      setNewKey("");
      setNewValue("");
    }
  };
  
  // Edit an existing key-value pair
  const handleEditRow = (key) => {
    const newValue = prompt("Enter new value:", tableData[key]);
    if (newValue !== null) {
      const updatedData = { ...tableData, [key]: newValue };
      setTableData(updatedData);

      // Send the update to the backend
      axios
        .put("http://localhost:3000/mappings/edit", {
          mappingId: selectedMappingId,
          key,
          newValue,
        })
        .then((response) => {
          console.log("Data updated successfully", response.data);
        })
        .catch((error) => {
          console.error("Error updating data:", error);
        });
    }
  };

  // Delete a key-value pair
  const handleDeleteRow = (key) => {
    const updatedData = { ...tableData };
    delete updatedData[key];
    setTableData(updatedData);

    // Send the delete request to backend
    axios
      .delete("http://localhost:3000/mappings/delete", {
        data: {
          mappingId: selectedMappingId,
          key,
        },
      })
      .then((response) => {
        console.log("Data deleted successfully", response.data);
      })
      .catch((error) => {
        console.error("Error deleting data:", error);
      });
  };

  if (loading) {
    return <div className="text-center text-lg font-semibold mt-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex items-center mb-6">
        <img src="download.png" alt="Logo" className="h-12 w-12 mr-4" />
        <h1 className="text-3xl font-bold">SignZy - Zoho</h1>
      </div>

      {/* Dropdown for selecting MappingID */}
      <div className="flex justify-center mb-6">
        <select
          value={selectedMappingId}
          onChange={handleMappingChange}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="kekaToDepartment">kekaToDepartment</option>
          <option value="kekaTogeography">kekaTogeography</option>
          <option value="kekaToZoho">kekaToZoho</option>
        </select>
      </div>

      {/* Add Row Section */}
      <div className="flex justify-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-1/4"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg w-1/4"
        />
        <button
          onClick={handleAddRow}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          + Add Row
        </button>
      </div>

      {/* Table Section */}
      <h2 className="text-xl font-semibold text-center mb-4">{selectedMappingId}</h2>
      {Object.keys(tableData).length === 0 ? (
        <p className="text-center text-gray-500">No data available for this mapping.</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Key</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Value</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tableData).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{key}</td>
                <td className="border border-gray-300 px-4 py-2">{value}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEditRow(key)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRow(key)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
