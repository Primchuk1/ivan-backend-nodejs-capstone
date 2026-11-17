const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, directoryPath); // Specify the upload directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original file name
    },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);

    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const newItem = req.body;
        //Assign a unique ID to the new item based on the last item's ID in the collection
        const lastItem = await collection.findOne(
            {},
            { sort: { id: -1 } }
        );

        if (lastItem) {
            newItem.id = (parseInt(lastItem.id, 10) + 1).toString();
        } else {
            newItem.id = "1";
        }

        newItem.date_added = Math.floor(new Date().getTime() / 1000);
        const secondChanceItem = await collection.insertOne(newItem);

        res.status(201).json(secondChanceItem.insertedId);
    } catch (e) {
        next(e);
    }
});





// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItem = await collection.findOne({ id: req.params.id });
        if (!secondChanceItem) {
            return res.status(404).send("secondChanceItem not found");
        } else {
            res.json(secondChanceItem);
        }
    } catch (e) {
        next(e);
    }
});

// Update and existing item
router.put('/:id', async (req, res, next) => {
    try {
        //Step 5: task 1 - insert code here
        //Step 5: task 2 - insert code here
        //Step 5: task 3 - insert code here
        //Step 5: task 4 - insert code here
        //Step 5: task 5 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const updatedItem = req.body;

        const secondChanceItem = await collection.findOne({ id: req.params.id });

        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        secondChanceItem.category = updatedItem.category || secondChanceItem.category;
        secondChanceItem.condition = updatedItem.condition || secondChanceItem.condition;
        secondChanceItem.description = updatedItem.description || secondChanceItem.description;
        secondChanceItem.age_days = updatedItem.age_days || secondChanceItem.age_days;
        secondChanceItem.age_years = Number((secondChanceItem.age_days / 365).toFixed(1));
        secondChanceItem.updatedAt = new Date();

        const updatepreloveItem = await collection.findOneAndUpdate(
            { id: req.params.id },
            { $set: secondChanceItem },
            { returnDocument: 'after' }
        );

        if (updatepreloveItem) {
            res.json({ "uploaded": "success" });
        } else {
            res.json({ "uploaded": "failed" });
        }


    } catch (e) {
        next(e);
    }
});

// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
        //Step 6: task 1 - insert code here
        //Step 6: task 2 - insert code here
        //Step 6: task 3 - insert code here
        //Step 6: task 4 - insert code here
        const db = await connectToDatabase();
        const collection = db.collection("secondChanceItems");
        const secondChanceItem = await collection.findOne({ id: req.params.id });
        if (!secondChanceItem) {
            logger.error('secondChanceItem not found');
            return res.status(404).json({ error: "secondChanceItem not found" });
        }

        await collection.deleteOne({ id: req.params.id });
        res.json({ "deleted": "success" });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
