const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

console.log(process.env.DB_PASS);


// middleware

app.use(cors());
app.use(express.json());

// add connection string



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lxtvnq3.mongodb.net/?retryWrites=true&w=majority`;

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

        const database = client.db('toyChamber');
        const toysCollection = database.collection('toys');

        // read toys and with filter limit 20 added
        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result)
        })


        // add new toy insertOne method
        app.post('/toys', async (req, res) => {
            const toy = req.body;
            console.log('new toy', toy);
            const result = await toysCollection.insertOne(toy);
            res.send(result);
        })
        // for tab sub category search use params id
        app.get("/toys/:subCategory", async (req, res) => {
            console.log(req.params.id);
            const jobs = await toysCollection
                .find({

                    subCategory: req.params.subCategory,
                })
                .toArray();
            res.send(jobs);
        });



        // search toy on all toy page by toy name with find method 
        app.get("/toyss/:ToyName", async (req, res) => {
            const ToyName = req.params.ToyName;
            const result = await toysCollection
                .find({
                    $or: [
                        {
                            toyName: { $regex: ToyName, $options: "i" }
                        },

                    ],
                })
                .toArray();
            res.send(result);
        });

        //   my toy with email [user verification]
        app.get("/myToys/:email", async (req, res) => {
            console.log(req.params.email);
            const toys = await toysCollection
                .find({
                    sellerEmail: req.params.email,
                })
                .toArray();
            res.send(toys);
        });


        //My delete
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            console.log('delete id', id);
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })

        //  single data filter
        app.get("/singleToy/:id", async (req, res) => {
            console.log(req.params.id);
            const toy = await toysCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(toy);
        });
        // 
        //   update
        // app.patch("/updateToy/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const body = req.body;
        //     console.log('update',body);
        //     const filter = { _id: new ObjectId(id) };
        //     const updateDoc = {
        //       $set: {
        //         price: body.price,
        //         detailDescription: body.detailDescription,
        //         availableQuantity: body.availableQuantity,
        //       },
        //     };
        //     console.log('update',body.price);
        //     const result = await toysCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        //   });
        //   
        app.put('/updateToy/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            console.log(id, toy);

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedToy = {
                $set: {
                    price: toy.price,
                    detailDescription: toy.detailDescription,
                    availableQuantity: toy.availableQuantity,
                }
            }

            const result = await toysCollection.updateOne(filter, updatedToy, options);
            res.send(result);

        })


        // get toy with id 




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// end connection string

app.get('/', (req, res) => {
    res.send('toy chamber server is running');
})

app.listen(port, () => {
    console.log(`toy chamber server is running on port: ${port}`)
})