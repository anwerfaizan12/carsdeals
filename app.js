const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require('cors');


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.use('/uploads', express.static(__dirname + '/uploads'));

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
  }));

require("dotenv").config({path:"../backend/config/config.env"});

const userRouter = require("./routers/userRouter"); 
const carRouter = require("./routers/carRouter");
const dealerRouter = require("./routers/dealerRouter");

app.use("/user",userRouter);
app.use("/car",carRouter);
app.use("/deal",dealerRouter);


module.exports = app;



