const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json()); // Middleware to parse JSON data
app.use(cors()); // Enable CORS for frontend

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
  });

const dynamoDB = new AWS.DynamoDB();

// Function to fetch mappings from DynamoDB
async function fetchMappings() {
  const params = { TableName: "MappingsTable" };

  try {
    const data = await dynamoDB.scan(params).promise();
    const mappings = {};

    data.Items.forEach((item) => {
      const mappingId = item.MappingID.S;
      const rawMappingsData = item.MappingsData.M;

      const processedMappingsData = {};
      Object.keys(rawMappingsData).forEach((key) => {
        processedMappingsData[key] = rawMappingsData[key].S;
      });

      mappings[mappingId] = processedMappingsData;
    });

    return mappings;
  } catch (err) {
    console.error("Error fetching mappings:", err);
    throw err;
  }
}

// Endpoint to fetch mappings
app.get("/mappings", async (req, res) => {
  try {
    const mappings = await fetchMappings();
    res.json(mappings);
  } catch (err) {
    res.status(500).json({ error: "Error fetching mappings", details: err });
  }
});

// Endpoint to add new mapping
app.post("/mappings/add", async (req, res) => {
  const { mappingId, key, value } = req.body;

  const params = {
    TableName: "MappingsTable",
    Key: {
      MappingID: { S: mappingId },
    },
    UpdateExpression: "SET MappingsData.#key = :value",
    ExpressionAttributeNames: {
      "#key": key,
    },
    ExpressionAttributeValues: {
      ":value": { S: value },
    },
  };

  try {
    await dynamoDB.updateItem(params).promise();
    res.json({ message: "Mapping added successfully" });
  } catch (err) {
    console.error("Error adding mapping:", err);
    res.status(500).json({ error: "Error adding mapping", details: err });
  }
});

// Endpoint to edit an existing mapping
app.put("/mappings/edit", async (req, res) => {
  const { mappingId, key, newValue } = req.body;

  const params = {
    TableName: "MappingsTable",
    Key: {
      MappingID: { S: mappingId },
    },
    UpdateExpression: "SET MappingsData.#key = :value",
    ExpressionAttributeNames: {
      "#key": key,
    },
    ExpressionAttributeValues: {
      ":value": { S: newValue },
    },
  };

  try {
    await dynamoDB.updateItem(params).promise();
    res.json({ message: "Mapping updated successfully" });
  } catch (err) {
    console.error("Error updating mapping:", err);
    res.status(500).json({ error: "Error updating mapping", details: err });
  }
});

// Endpoint to delete a mapping
app.delete("/mappings/delete", async (req, res) => {
  const { mappingId, key } = req.body;

  const params = {
    TableName: "MappingsTable",
    Key: {
      MappingID: { S: mappingId },
    },
    UpdateExpression: "REMOVE MappingsData.#key",
    ExpressionAttributeNames: {
      "#key": key,
    },
  };

  try {
    await dynamoDB.updateItem(params).promise();
    res.json({ message: "Mapping deleted successfully" });
  } catch (err) {
    console.error("Error deleting mapping:", err);
    res.status(500).json({ error: "Error deleting mapping", details: err });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
