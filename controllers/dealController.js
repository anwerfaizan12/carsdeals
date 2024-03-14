const { MongoClient } = require('mongodb');

// MongoDB connection URI
const uri = process.env.URL;

// Create a new MongoDB client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db("sample_mflix");

const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;


// Function to create a deal in the database
module.exports.createDeal = async function createDeal(req, res) {
    try {


        // Assuming data is received from the client in req.body
        const { carId, clientId } = req.body;

        // Create a new deal document
        const newDeal = {
            carId,
            clientId
        };

        // Insert the new deal document into the 'deals' collection
        await db.collection('deals').insertOne(newDeal);

        // Respond to the client with a success message or newly created deal data
        res.status(201).json({ message: 'Deal created successfully', deal: newDeal });
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Ensure the MongoDB client is closed after operations
        await client.close();
    }
};



module.exports.dealerDetails = async function dealerDetails(req,res){

    try {
      const { isLoggedIn } = req.cookies;
      if (!isLoggedIn) {
          return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = req.cookies.isLoggedIn;
      let payload = jwt.verify(token, secretKey);
      if (payload) {
          const username = payload.username;
          const userData = await db.collection('users').findOne({ username });
          if (userData.role === "dealer") {
            let ids = userData.products;
            const cars= await db.collection('cars').find().toArray();

            const filteredCars = [];
            for(let i=0;i<cars.length;i++){
                const car=cars[i];
                const dealerName = car.dealer;
                if(dealerName === username){
                    filteredCars.push(car);
                }
            }

            console.log(filteredCars);
            
              res.status(200).json({
                data:filteredCars,
                username:username
              });
          }
          else {
              return res.status(401).json({ error: 'Unauthorized' });
          }
      }
      else{
        res.ststus(500).json({
            message:"Unauthorized"
        })
      }
  } catch (error) {
      // Handle error
      res.status(500).json({ error: 'Internal server error' });
  }
  }


