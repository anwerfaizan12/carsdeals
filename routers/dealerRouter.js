const express = require("express");
const {createDeal, dealerDetails} = require("../controllers/dealController");

const dealerRouter = express.Router();

dealerRouter.post("/create",createDeal);
dealerRouter.get("/dealerdetails",dealerDetails);

module.exports = dealerRouter;