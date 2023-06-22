const mongoose = require("mongoose");
const {databaseConnector} = require("./database");

// Import models
const {Role} = require("./models/RoleModel");
const {User} = require("./models/UserModel");
const {Post} = require("./models/PostModel");

// Configure dotenv
const dotenv = require("dotenv");
dotenv.config();

const roles = [
    {
        name: "regular",
        description: "A regular user can view, create and read data. They can edit and delete only their own data."
    },
    {
        name: "admin",
        description: "An admin user has full access and permissions to do anything and everything within this API."
    },
    {
        name: "banned",
        description: "A banned user can read data, but cannot do anything else."
    }
];

// To be made after building authorization
const users = [

];

// To be made after successfully creating users
const posts = [

];


// Connect to the database.
var databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
    case "test":
        databaseURL = "mongodb://localhost:27017/ExpressBuildAnAPI-test";
        break;
    case "development":
        databaseURL = "mongodb://localhost:27017/ExpressBuildAnAPI-dev";
        break;
    case "production":
        databaseURL = process.env.DATABASE_URL;
        break;
    default:
        console.error("Incorrect JS environment specified, database will not be connected.");
        break;
}

// This functionality is a big promise-then chain.
// This is because it requires some async functionality,
// and that doesn't work without being wrapped in a function.
// Since .then(callback) lets us create functions as callbacks,
// we can just do stuff in a nice .then chain.
databaseConnector(databaseURL).then(() => {
    console.log("Database connected successfully!");
}).catch(error => {
    console.log(`An error occurred during database connection, error: ${error}`);
}).then(async () => {
    if (process.env.WIPE == "true"){
        const collections = await mongoose.connection.db.listCollections().toArray();

        collections.map((collection) => collection.name)
        .forEach(async (collectionName) => {
            mongoose.connection.db.dropCollection(collectionName);
        });
        console.log("Old DB data deleted");
    }
}).then(async () => {
    await Role.insertMany(roles);
    console.log("New DB data created");
}).then(() => {
    mongoose.connection.close();
    console.log("DB seed connection closed");
});
