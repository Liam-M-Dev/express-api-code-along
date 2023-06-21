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