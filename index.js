const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

const host = "localhost";
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vt98y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const bookCollection = client.db("bookBuddy").collection("book");

    // POST book
    app.post("/addBook", async (req, res) => {
      const book = req.body;
      const result = await bookCollection.insertOne(book);
      res.send({ success: "true", message: "Added a new book successfully" });
    });

    // GET book :get all book
    app.get("/book", async (req, res) => {
      const query = {};
      const cursor = bookCollection.find(query);
      const result = await cursor.toArray();
      const count = await bookCollection.estimatedDocumentCount();
      res.send({ result, count });
    });
    // GET book :get book by limit
    app.get("/book/limit/:limit", async (req, res) => {
      const limit = parseInt(req.params.limit);
      // console.log(parseInt(limit));
      const query = {};
      const cursor = bookCollection.find(query).limit(limit);
      const result = await cursor.toArray();
      res.send({ result });
    });
    // GET a book by id
    app.get("/book/id/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });
    // GET MyItems by user email
    app.get("/myBook", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const cursor = bookCollection.find(query);
      const result = await cursor.toArray();
      res.send({ result });
    });

    //UPDATE Book quantity by id
    app.put("/book/:id", async (req, res) => {
      const id = req.params.id;
      const quantity = await req.body.quantity;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateBook = { $set: { quantity: quantity } };
      const result = await bookCollection.updateOne(
        filter,
        updateBook,
        options
      );
      if (!result.acknowledged) {
        return res
          .status(500)
          .send({ success: false, error: "Something went wrong" });
      }
      res
        .status(200)
        .send({ success: true, message: "Stock updated successfully" });
    });

    app.get("/countBook", async (req, res) => {
      const count = await bookCollection.estimatedDocumentCount();
      res.send({ count });
    });
    // DELETE : delete a book by id
    app.delete("/book/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const book = await bookCollection.findOne(query);
      const result = await bookCollection.deleteOne(query);
      // res.send(result);
      if (result.deletedCount == 1) {
        return res.status(200).send({
          success: "true",
          message: `${book?.name || " "} Deleted successfully`,
          book,
        });
      }
    });

    console.log("DB Connected");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Book Buddy server is running");
});

app.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
