const { MongoClient } = require('mongodb');
const uri = process.env.URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db("sample_mflix");

const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;




module.exports.signupAsUser = async function signupAsUser(req, res) {
  try {

    const { username, email, password, location } = req.body;
    console.log(req.body);
    // Add more validation as needed

    // Check if the user already exists in the database
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = {
      username,
      email,
      password: hashedPassword,
      location,
      role: "client",
      vehicles: []
    };

    // Insert the new user document into the 'users' collection
    await db.collection('users').insertOne(newUser);


    // Respond to client with success message or newly created user data
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports.signupAsDealer = async function signupAsDealer(req, res) {
  try {

    // Assuming data is received from client in req.body
    const { username, email, password, location } = req.body;

    // Check if the user already exists in the database
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds


    // Create a new user document
    const newUser = {
      username,
      email,
      password: hashedPassword,// You should hash the password before storing it in the database for security
      location,
      role: "dealer",
      vehicles: [],
      products: []
    };

    // Insert the new user document into the 'users' collection
    await db.collection('users').insertOne(newUser);

    // Respond to client with success message or newly created user data
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.logout = function logout(req, res) {

  const { isLoggedIn } = req.cookies;
    jwt.verify(isLoggedIn, secretKey, {}, async (err, info) => {
      if (err) {
        res.status(500).json(err);
      }
    })
  res.cookie('isLoggedIn', '', { maxAge: 1 });
  res.status(200).json({
    success: true,
    message: "user logged out successfully"
  })
}



module.exports.login = async function login(req, res) {
  try {
    
    const { email, password } = req.body;

    // Find user by username and password

    // Find the user with the provided email in the database
    const user = await db.collection('users').findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, secretKey);
    res.cookie('isLoggedIn', token, { httpOnly: true });
    return res.status(200).json({
      data: user,
      message: "Logged In Successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
};



module.exports.updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;


    // Find user by email in the database
    const user = await db.collection('users').findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


    // Compare old password with the hashed password from the database
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    // If old password doesn't match, return error
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password"
      });
    }

    // Hash the new password with the secret key
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password in the database
    user.password = hashedNewPassword;
    await db.collection('users').updateOne({ email }, { $set: { password: hashedNewPassword } });

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};




module.exports.profile = function profile(req, res) {
  const isLoggedInCookie = req.cookies['isLoggedIn'];

  if (!isLoggedInCookie) {
    return res.status(401).json({ error: 'Unauthorized - Cookie not found' });
  }

  jwt.verify(isLoggedInCookie, secretKey, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(401).json({ error: 'Unauthorized - Invalid JWT' });
    }

    // Attach the decoded payload to the request for further processing
    res.status(200).json({
      success: true,
      data: decoded
    });
  });
};

