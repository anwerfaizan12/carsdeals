// db.js

const { MongoClient } = require('mongodb');

// Connection URL
const uri = process.env.URL;

// Database Name
const dbName = 'sample_mflix'; // Replace with your database name

// Create a new MongoClient
const client = new MongoClient(uri);

// Connect to the server
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected successfully to MongoDB');
        return client.db(dbName);
    } catch (error) {
        console.error('Error occurred while connecting to MongoDB:', error);
        throw error;
    }
}

module.exports = connectToDatabase;
