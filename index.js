const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000 || process.env.PORT;
require('dotenv').config()
// midleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);


const admin = require("firebase-admin");

const serviceAccount = require("./3d-server.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const verifyToken = (req, res, next) => { 
  console.log('I am from middleware');
  const authorization = req.headers.authorization
  const token = authorization.split(' ')[1]
  console.log(token);

    
    next();


}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.2gqzmaz.mongodb.net/?appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get('/', (req, res) => {
  res.send('Server open');
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const modelDB = client.db('modelDB');
    const products = modelDB.collection('products');

    app.get('/products', async (req, res) => {
      const cursor = products.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/products/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await products.findOne(query);
      res.send(result);
    });

    app.post('/products',verifyToken, async (req, res) => {
      const addProduct = req.body;
      const result = await products.insertOne(addProduct);
      res.send(result);
    });

    app.delete('/products/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await products.deleteOne(query);
      res.send(result);
    });

    app.patch('/products/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: req.body };
      const options = {};
      const result = await products.updateOne(query, update, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`port is :${port}`);
});
