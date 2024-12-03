import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [mappings, setMappings] = useState([]);
  const [newMapping, setNewMapping] = useState({ MappingID: "", MappingsData: {} });

  // Fetch all mappings
  useEffect(() => {
    axios.get("http://localhost:3001/mappings").then((response) => {
      setMappings(response.data);
    });
  }, []);

  // Add a new mapping
  const addMapping = () => {
    axios.post("http://localhost:3001/mappings", newMapping).then(() => {
      setMappings([...mappings, newMapping]);
      setNewMapping({ MappingID: "", MappingsData: {} });
    });
  };

  // Delete a mapping
  const deleteMapping = (id) => {
    axios.delete(`http://localhost:3001/mappings/${id}`).then(() => {
      setMappings(mappings.filter((mapping) => mapping.MappingID !== id));
    });
  };

  // Update a mapping
  const updateMapping = (id, updatedData) => {
    axios.put(`http://localhost:3001/mappings/${id}`, updatedData).then(() => {
      setMappings(
        mappings.map((mapping) =>
          mapping.MappingID === id ? { ...mapping, MappingsData: updatedData.MappingsData } : mapping
        )
      );
    });
  };

  return (
    <div>
      <h1>Mappings Manager</h1>
      <div>
        <h2>Add New Mapping</h2>
        <input
          type="text"
          placeholder="MappingID"
          value={newMapping.MappingID}
          onChange={(e) => setNewMapping({ ...newMapping, MappingID: e.target.value })}
        />
        <textarea
          placeholder="MappingsData (JSON format)"
          value={JSON.stringify(newMapping.MappingsData)}
          onChange={(e) => setNewMapping({ ...newMapping, MappingsData: JSON.parse(e.target.value) })}
        />
        <button onClick={addMapping}>Add</button>
      </div>

      <h2>Existing Mappings</h2>
      <ul>
        {mappings.map((mapping) => (
          <li key={mapping.MappingID}>
            <h3>{mapping.MappingID}</h3>
            <pre>{JSON.stringify(mapping.MappingsData, null, 2)}</pre>
            <button onClick={() => deleteMapping(mapping.MappingID)}>Delete</button>
            <button
              onClick={() =>
                updateMapping(mapping.MappingID, {
                  MappingID: mapping.MappingID,
                  MappingsData: { ...mapping.MappingsData, newKey: "newValue" },
                })
              }
            >
              Update
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
