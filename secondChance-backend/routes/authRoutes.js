const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger
dotenv.config();

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        // Task 2: Access MongoDB `users` collection
        // Task 3: Check if user credentials already exists in the database and throw an error if they do
        // Task 4: Create a hash to encrypt the password so that it is not readable in the database
        // Task 5: Insert the user into the database
        // Task 6: Create JWT authentication if passwords match with user._id as payload
        // Task 7: Log the successful registration using the logger
        // Task 8: Return the user email and the token as a JSON
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send('Email and password are required');
        }
        const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hashedPassword,
            createdAt: new Date(),
        });


        const result = await collection.insertOne(newUser);
        const token = jwt.sign({ userId: result.insertedId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({ email, token });

    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const { email, password } = req.body;
        const user = await collection.findOne({ email: email });

        if (!user) {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.error('Invalid password');
            return res.status(400).json({ error: 'Invalid password' });
        }

        const userName = user.firstName;
        const userEmail = user.email;

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.json({ token, userName, userEmail });
    } catch (e) {
        return res.status(500).send('Internal server error');

    }
});


module.exports = router;