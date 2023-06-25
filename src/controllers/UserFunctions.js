const {User} = require('../models/UserModel');

const dotenv = require("dotenv");
dotenv.config();

// Encryption and decryption functionality
let encAlgorithm = require("crypto");
let encPrivateKey = "aes-256-cbc";
let encIV = crypto.scryptSync(process.env.ENC_KEY, "SpecialSalt", 32);
let cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
let decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);

// Convert a given string into an encrypted string
function encryptString(data){
    cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
    return cipher.update(data, "utf8", "hex") + cipher.final("hex");
}

// Turn encrypted data back into a plaintext string
function decryptString(data){
    decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);
    return decipher.update(data, "hex", "utf8") + decipher.final("utf8");
}

// Assumes an encrypted string is a JSON object
// Decrypts that string and turns it into a regular JavaScript Object.
function decryptObject(data){
    return JSON.parse(decryptString(data));
}

// -----Hashing and Salting functionality-------

const bcrypt = require("bcrypt");
const saltRounds = 10;

async function hashString(stringToHash){
    let saltToAdd = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(stringToHash, saltToAdd);
}

async function validateHashedData(providedUnhashedData, storedHashedData){
    return await bcrypt.compare(providedUnhashedData, storedHashedData);
}

// ----JWT functionality-----

const jwt = require("jsonwebtoken");

function generateJWT(payloadObj){
    return jwt.sign(payloadObj, process.env.JWT_SECRET, {expiresIn: "7d"});
}

async function generateUserJWT(userDetails){
    // Encrypt payload so that its not plaintext when viewed outside of this app
    let encryptedUserData = encryptString(JSON.stringify(userDetails));
    // the expiresIn option only works if the payload is an object not a string.
    return generateJWT({data: encryptedUserData});
}

async function verifyUserJWT(userJWT){
    // Verify JWT is still valid
    let userJwtVerified = jwt.verify(userJWT,process.env.JWT_SECRET, {complete: true});
    // decrypt the encoded payload
    let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
    // parse the decrypted data into an object
    let userData = JSON.parse(decryptedJwtPayload);
    // Find user mentioned in JWT
    let targetUser = await User.findById(userData.userID).exec();
    // If the JWT data matches the stored data..
    if (targetUser.password === userData.password && targetUser.email === userData.email){
        // User details are valid, make a fresh jwt to extend tokens valid time
        return generateJWT({data: userJwtVerified.payload.data});
    } else {
        // Otherwise user details are invalid, no JWT token issued
        // When a frontend receives this error it should redirect to sign up page
        throw new Error({message: "Invalid user token."});
    }
}

// -------------MongoDB/MongooseJS functionality------------

async function getAllUsers(){
    // Returns array of raw mongoDB database documents.
    return await User.find({});
}

async function getSpecificUser(userID){
    // Returns the raw mongoDB database document
    return await User.findById(userID);
}

async function createUser(userDetails){
    // Hash the password
    userDetails.hashedPassword = await hashString(userDetails.password);

    // Create new user based on userDetails data
    let newUser = new User({
        email: userDetails.email,
        password: userDetails.password,
        username: userDetails.username,
        country: userDetails.country,
        role: userDetails.roleID
    })

    // Save new user to database
    return await newUser.save();
}

async function updateUser(userDetails){
    // Find user, update it, return the updated user data.
    return await User.findByIdAndUpdate(userDetails.userID, userDetails.updatedData, {returnDocument: "after"}).exec();

}

async function deleteUser(userID){
    return await User.findbyIdAndDelete(UserID).exec();
}

// ----Exports-----

module.exports = {
    encryptString, decryptString, decryptObject, hashString, validateHashedData, 
    generateJWT, generateUserJWT, verifyUserJWT, 
    getAllUsers, getSpecificUser, createUser, updateUser, deleteUser
}