// Require specific models so that we can
// create functionality involving them.
const {Role} = require("../models/RoleModel");
const {User} = require("../models/UserModel");

// Model.find({}) returns all documents in a collection.
async function getAllRoles(){
    return await Role.find({});
};

// Model.find({field: value}) returns documents
// that have a specified value for a specified field.
async function getUsersWithRole(roleName){
    let roleID = await Role.find({role: roleName}).exec();

    let usersFound = await User.find({role: roleID}).exec();

    return usersFound;
}

module.exports = {
    getAllRoles,
    getUsersWithRole
}