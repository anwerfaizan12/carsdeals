const multer = require('multer');
const path = require('path');
const fs = require("fs");
const secretKey = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');


const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.URL;
const client = new MongoClient(uri);
const db = client.db("sample_mflix");



// carController.js
module.exports.createCar = async function createCar(req, res) {
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
                // Assuming data is received from client in req.body
                const { name, model, type, location } = req.body;

                const { originalname, path } = req.file;
                const parts = originalname.split('.');
                const ext = parts[parts.length - 1];
                const newPath = path + '.' + ext;
                fs.renameSync(path, newPath);


                // Create a new car document
                const newCar = {
                    type,
                    name,
                    model,
                    location,
                    carImage: newPath, // Save file path or null if no image uploaded
                    owner: "",
                    status: "Not Sold",
                    dealer: username
                };


                // Insert the new car document into the 'cars' collection (assuming MongoDB is used)
                await db.collection('cars').insertOne(newCar);

                const user = await db.collection('users').findOne({ username: username });

                res.status(201).json({ message: 'Car created successfully', car: newCar });
            }
            else {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }
    } catch (error) {
        // Handle error
        res.status(500).json({ error: 'Internal server error' });
    }
};



// function to get cars =>
module.exports.getAllCars = async function getAllCars(req, res) {
    try {
        const { isLoggedIn } = req.cookies;
        if (!isLoggedIn) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Assuming 'comments' is the name of your MongoDB collection
        const data = await db.collection('cars').find().toArray();
        res.status(200).json(data);
    } catch (error) {
        // Handle error
        res.status(500).json({
            success: false,
            message: error
        })
    }
}




module.exports.getCar = async function getCar(req, res) {
    try {
        const { isLoggedIn } = req.cookies;
        jwt.verify(isLoggedIn, secretKey, {}, async (err, info) => {
            if (err) {
                res.status(500).json({ error: err });
            }
            const { id } = req.params;

            // console.log(id);
            const carData = await db.collection('cars').findOne({ _id: new ObjectId(id) });

            res.status(200).json({
                success: true,
                data: carData,
                message: "Data found successfully"
            });

        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports.createDeal = async function createDeal(req, res) {
    try {
        const { isLoggedIn } = req.cookies;
        jwt.verify(isLoggedIn, secretKey, {}, async (err, info) => {
            if (err) {
                res.status(500).json(err);
            }
            const { id } = req.params;
            const username = info.username;
            const status = "sold";
            // Create a new deal document
            const newDeal = {
                carId: id,
                owner: username
            };

            // Insert the new deal document into the 'deals' collection (assuming MongoDB is used)
            await db.collection('deals').insertOne(newDeal);
            const carData = await db.collection('cars').findOne({ _id: new ObjectId(id) });
            await db.collection('cars').updateOne({ _id: new ObjectId(id) }, { $set: { owner: username } });
            await db.collection('cars').updateOne({ _id: new ObjectId(id) }, { $set: { status: status } });

            res.status(200).json({
                message: "car created successfully"
            })

        })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

// To get sold cars data
module.exports.soldCars = async function soldCars(req, res) {
    try{
    const { isLoggedIn } = req.cookies;
    jwt.verify(isLoggedIn, secretKey, {}, async (err, info) => {
        if (err) {
            res.status(500).json(err);
        }
        const cars = await db.collection('cars').find().toArray();
        const soldCars = [];
        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            if (car.status === "sold") {
                soldCars.push(car);
            }
        }
        res.status(200).json({
            success: true,
            data: soldCars,
            message: "sold cars recieved successfully"
        })

    })
}catch(error){
    res.status(500).json({
        success:false,
        message:error.message
    })
}
}


// To get dealer cars data
module.exports.dealerCars = async function dealerCars(req, res) {
    try {
        const { isLoggedIn } = req.cookies;
        jwt.verify(isLoggedIn, secretKey, {}, async (err, info) => {
            if (err) {
                res.status(500).json(err);
            }
            const { dealerName } = req.body;
            const dealer = dealerName.trim();
            const cars = await db.collection('cars').find().toArray();
            let dealerCars = [];
            for (let i = 0; i < cars.length; i++) {
                const car = cars[i];
                const carDealer = car.dealer;
                const Cardealer = carDealer.trim();
                if (Cardealer.toLowerCase() === dealer.toLowerCase()) {
                    dealerCars.push(car);
                }
            }
            console.log(dealerCars);
            res.status(200).json({
                success: true,
                data: dealerCars,
                message: "dealer cars recieved successfully"
            })

        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


// To get owner cars data
module.exports.clientCars = async function clientCars(req, res) {
    try{
        // const data = req.body;
    const { isLoggedIn } = req.cookies;
    jwt.verify(isLoggedIn, secretKey, {}, async (err, info) => {
        if (err) {
            res.status(500).json(err);
        }
        const {ownerName} = req.body;
        const owner = ownerName.trim();
        const cars = await db.collection('cars').find().toArray();
        const ownerCars = [];
        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            const carOwner = car.owner;
            const Carowner = carOwner.trim();
            if (owner.toLowerCase() === Carowner.toLowerCase()) {
                ownerCars.push(car);
            }
        }
        res.status(200).json({
            success: true,
            data: ownerCars,
            message: "dealer cars recieved successfully"
        })

    })
}catch(error){
    res.status(500).json({
        success:false,
        message:error.message
    })
}
}
