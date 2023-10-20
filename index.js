const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello there. Is there anyone in the world!')
})


//*********************************** DATABASE START  ********************************
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r8yk5up.mongodb.net/?retryWrites=true&w=majority`;

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

        // Connect to the "insertDB" database and access its "haiku" collection
        const database = client.db("productDB")
        const productCollection = database.collection("product")
        const cartData = database.collection("cart");

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product)
            res.send(result)
        })

        app.get('/products/:brandName', async (req, res) => {
            const brandName = req.params.brandName;
            const query = { brandName: brandName };
            const cursor = productCollection.find(query);

            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:brandName/:id', async (req, res) => {
            const brandName = req.params.brandName;
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.put('/products/:brandName/:id', async (req, res) => {
            const brandName = req.params.brandName;
            const id = req.params.id;
            const newProduct = req.body;
            const filter = { brandName: brandName, _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateProduct = {
                $set: {
                    name: newProduct.name,
                    brandName: newProduct.brandName,
                    type: newProduct.type,
                    price: newProduct.price,
                    rating: newProduct.rating,
                    image: newProduct.image
                }
            }
            const result = await productCollection.updateOne(filter, updateProduct, options)
            res.send(result);
        })

        // ******************** CART ***********************//
        app.post('/cart', async (req, res) => {
            const cart = req.body;
            const result = await cartData.insertOne(cart);
            res.send(result);
        })

        app.get('/cart/:userEmail', async (req, res) => {
            const userEmail = req.params.userEmail;
            const query = { userEmail: userEmail }

            const cursor = cartData.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartData.deleteOne(query);
            res.send(result)
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
//************************************ DATABASE END *************************************


app.listen(port, () => {
    console.log('server running from port:', port);
})