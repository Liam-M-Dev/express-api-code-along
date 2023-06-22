// Import Express
const express = require("express");
const router = express.Router();

// Import functions from RoleFunctions.js
const {getUsersWithRole, getAllRoles} = require("./RoleFunctions");

// Configure routes attached to router instance
router.get("/", async (request, response) => {
    let responseData = {};

    responseData = await getAllRoles();

    response.json({
        data: responseData
    });
});

// Show all users with attached role
// uses route params
router.get("/:routeName", async (request, response) => {
    let responseData = {};

    responseData = await getUsersWithRole(request.params.roleName);

    response.json({
        data: responseData
    });
});

module.exports = router;