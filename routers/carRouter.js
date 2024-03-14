const express = require("express");
const multer = require("multer");
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files
const {createCar, getAllCars, getCar, createDeal, soldCars, dealerCars, clientCars} = require("../controllers/carController");

const carRouter = express.Router();

carRouter.get('/cars',getAllCars);
carRouter.post('/createcar',upload.single('file'),createCar);

carRouter
.route('/cardetails/:id')
.get(getCar);


carRouter
.route('/buy/:id')
.get(createDeal);

carRouter.get("/soldcars",soldCars);
carRouter.post("/dealercars",dealerCars);
carRouter.post("/clientcars",clientCars);

module.exports = carRouter;