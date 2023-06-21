// CONFIGURATION
// configure dotenv to make .env available for use
const dotenv = require("dotenv");
dotenv.config();

// Import express package and configure host/port data
const express = require("express");
const app = express();
// If no process.env.X is found assign default value
const HOST = process.env.HOST || "localhost";
const PORT = process.env.POST || 3000;

// configure basic helmet settings on server instance
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc:["'self'"]
    }
}));

// Configure basic CORS settings on server instance
// This project exists without a front end but for purpose sakes
// any front-end interaction with this API is listed in the array of origins
const cors = require("cors");
let corsOptions = {
    origin: ["http://localhost:5000", "https://deployedApp.com"],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Setting up database connection depending on environment currently running
const mongoose = require("mongoose");
let databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
    case "test":
        databaseURL = "mongodb://localhost:27017/ExpressBuildAPI-test";
        break;
    case "development":
        databaseURL = "mongodb://localhost:27017/ExpressBuildAPI-dev";
        break;
    case "production":
        databaseURL = process.env.DATABASE_URL;
        break;
    default:
        console.error("Incorrect JS environment specified, database will not be connected.");
        break;
}
const {databaseConnector} = require("./database");
databaseConnector(databaseURL).then(() => {
    console.log("Database connected successfully");
}).catch(error => {
    console.log(`Some error has occurred connecting to the database: ${error}`);
});




// ROUTES
// Route to receive information about the database connection
app.get("/databaseHealth", (request, response) => {
    let databaseState = mongoose.connection.readyState;
    let databaseName = mongoose.connection.name;
    let databaseModels = mongoose.connection.modelNames();
    let databaseHost = mongoose.connection.host;

    response.json({
        readyState: databaseState,
        dbName: databaseName,
        dbModels: databaseModels,
        dbHost: databaseHost
    })
})

// Route to check express setup works
app.get("/", (request, response) => {
    response.json({
        message: "Hello World!"
    });
});

// 404 message route
app.get("*", (request, response) => {
    response.status(404).json({
        message: "No route found with that path",
        attemptedPath: request.path
    });
});

// Export App host and port to run server
module.exports = {
    HOST,
    PORT,
    app
}