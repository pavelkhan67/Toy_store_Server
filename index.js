const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgvq2ef.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const toyCollection = client.db('toyStore').collection('toys');

        app.get('/toys', async (req, res) => {
            const cursor = toyCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/toys/:category", async (req, res) => {
            if (req.params.category == "Avengers" || req.params.category == "X-Men" || req.params.category == "GhostRider") {
                const result = await toyCollection.find({ subcategory: req.params.category }).toArray();
                res.send(result);
            }
            else {
                const result = await toyCollection.find({}).toArray();
                res.send(result);
            }
        });

        app.get("/toy/:id", async (req, res) => {
            const result = await toyCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(result);
        });

        app.post('/toys', async (req, res) => {
            const added = req.body;
            console.log(added);
            const result = await toyCollection.insertOne(added);
            res.send(result);
        })

        app.get("/mytoys/:email", async (req, res) => {
            console.log(req.params.email);
            const jobs = await toyCollection
                .find({
                    email: req.params.email,
                }).sort({price: 1})
                .toArray();
            res.send(jobs);
        });

        app.get("/searchtoy/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toyCollection
                .find({
                    name: { $regex: text, $options: "i" }
                })
                .toArray();
            res.send(result);
        });

        app.delete('/mytoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy Store is running')
})

app.listen(port, () => {
    console.log(`Toy Store is running on port: ${port}`);
})