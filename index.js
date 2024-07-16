//BackEND Programming Environment
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

// Middleware - it will make connection to our frontend website
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!'); // This display on the output screen
});

// MongoDB configuration
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://MernBookStore:f2qY2gh0Df9Kiwct@johnnie.u5mms9a.mongodb.net/?retryWrites=true&w=majority&appName=Johnnie";

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
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Creating a Collection of BookDatabase
    const bookCollections = client.db("BookInventory").collection("Books");

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Inserting a Book into the database using the POST method
    app.post("/upload-book", async (req, res) => {
      try {
        const data = req.body;
        const result = await bookCollections.insertOne(data);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Error inserting book data' });
      }
    });

    // Getting all books from database
    app.get("/all-books", async (req, res) => {
      try {
        let query = {};
        if (req.query.category) {
          query = { category: req.query.category };
        }
        const results = await bookCollections.find(query).toArray();
        res.send(results);
      } catch (error) {
        res.status(500).send({ error: 'Error fetching books data' });
      }
    }); 

    //finding a book by Category 
    app.get ("/all-books", async (req, res) => {
      let query ={};
      if(req.query?.category) {
        query = {category: req.query.category};
      }
      const results = await bookCollections.find(query).toArray();
      res.send(results);
  
    });
  
    // getting a single book from database
    app.get ("books/:id", async (req, res) => {
      const id= req.params.id;
      const filter ={_id: new ObjectId((id))};
      const result =await bookCollections.findOne(filter);
    })
    // Updating a book in the database using PATCH method
    app.patch("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateBookData = req.body;

        // Ensure the ObjectId is valid
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid book ID' });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updateBookData
          }
        };
        const options = { upsert: true }; 

        // Updating here
        const result = await bookCollections.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ error: 'Book not found' });
        }
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'Error updating book data' });
      }
    });

    // Deleting a book from MongoDB database
    app.delete("/books/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Ensure the ObjectId is valid
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: 'Invalid book ID' });
        }

        const filter = { _id: new ObjectId(id) };
        const results = await bookCollections.deleteOne(filter);
        res.send(results);
      } catch (error) {
        res.status(500).send({ error: 'Error deleting book' });
      }
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`); // This display on the terminal
});
