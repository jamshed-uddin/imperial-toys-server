const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

// database

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
    // await client.connect();

    const toyDatabase = client.db("toyDatabase");
    const toyCollection = toyDatabase.collection("toys");

    // create toy info
    app.post("/alltoys", async (req, res) => {
      const newToy = req.body;
      console.log("new newToy:", newToy);
      const result = await toyCollection.insertOne(newToy);
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
        req.params.category == "Star-wars"
      ) {
        const result = await toyCollection
          .find({ sub_category: req.params.category })
          .toArray();
        return res.send(result);
      }
    });

    // single toy detail
    app.get("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    // update toy
    app.put("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      console.log(toy);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = {
        $set: {
          price: toy.price,
          quantity: toy.quantity,
          description: toy.description,
        },
      };

      const result = await userCollection.updateOne(
        filter,
        updatedToy,
        options
      );
      res.send(result);
    });

    // delete a toy
    app.delete("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
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
  res.send("imperial toys server is running");
});

app.listen(port, () => {
  console.log("this toyshop server is running on", port);
});
