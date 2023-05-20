const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.phenf1e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyDatabase = client.db("toyDatabase");
    const toyCollection = toyDatabase.collection("toys");

    // create toy info
    app.post("/alltoys", async (req, res) => {
      const user = req.body;
      console.log("new user:", user);
      const result = await toyCollection.insertOne(user);
      res.send(result);
    });

    // get all toy info
    app.get("/alltoys", async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // categorywise filter

    app.get("/alltoys/:category", async (req, res) => {
      if (
        req.params.category == "DC" ||
        req.params.category == "Marvel" ||
        req.params.category == "Star Wars"
      ) {
        const result = await toyCollection
          .find({ sub_category: req.params.category })
          .toArray();
        return res.send(result);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("crud server is running");
});

app.listen(port, () => {
  console.log("this crud server is running on", port);
});
