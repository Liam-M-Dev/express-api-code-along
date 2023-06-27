const express = require("express");
const router = express.Router();

const {
    getAllPosts, getPostById, getPostsByAuthor, createPost, updatePost, deletePost
} = require("./PostFunctions");

// Imports for Authorization Middleware
const jwt = require("jsonwebtoken");
const {Role} = require("../models/RoleModel");
const {Post} = require("../models/PostModel");
const {User} = require("../models/UserModel");
const {verifyUserJWT, decryptString} = require("./UserFunctions");

// Make sure JWT available in the headers is valid, refresh to keep token usable for longer
const verifyJwtHeader = async (request, response, next) => {
    let rawJwtHeader = request.headers.jwt;

    let jwtRefresh = await verifyUserJWT(rawJwtHeader);

    next();
}

const verifyJwtRole = async (request, response, next) => {
    // Verify JWT is still valid
    let userJwtVerified = jwt.verify(request.headers.jwt, process.env.JWT_SECRET, {complete: true});
    // Decrypt payload
    let decryptedJwtPayload = decryptString(userJwtVerified.payload.data);
    // Parse decrypted data into an object
    let userData = JSON.parse(decryptedJwtPayload);

    let userDoc = User.findById(userData.userID).exec();
    let userRoleName = Role.findById(userDoc.role).exec();

    // Attach the role request for the backend to use.
    // Note that the user's role will never be available on front-end 
    // with this technique
    // This means that that can't just manipulate the JWT to access admin stuff.
    console.log("User role is: " + userRoleName.name);
    request.headers.userRole = userRoleName.name;
    request.headers.userID = userDoc.id.toString();

    next();
}

const onlyAllowAdminOrAuthor = async (request, response, next) => {
    let postAuthor = await Post.findById(request.params.postID).exec().then((data) => {return data.author});

    if (request.headers.userRole == "admin" || postAuthor == request.headers.userID){
        next(); 
    } else {
        next(new Error("User not authorized."));
    }
}

// Show all posts
router.get("/", async (request, response) => {
    let allPosts = await getAllPosts();

    response.json({
        postsCount: allPosts.length,
        postsArray: allPosts
    });
});

// Show posts by specific user
router.get("/author/:authorID", async (request, response) => {
    let postsByAuthor = await getPostsByAuthor(request.params.authorID);

    response.json({
        postsCount: postsByAuthor.length,
        postsArray: postsByAuthor
    });
});

// Show specific post by ID
router.get("/:postID", async (request, response) => {
    response.json(await getPostById(request.params.postID));
});

// Create a post
router.post("/", async (request, response) => {
    response.json(await createPost(request.body.postDetails));
});

// Update a specific post
router.put("/:postID", verifyJwtHeader, verifyJwtRole, onlyAllowAdminOrAuthor, async (request, response) => {
    let postDetails = {
        postID: request.params.postID,
        updatedData: request.body.newPostData
    }

    response.json(await updatePost(postDetails));
});

// Delete a specific post
router.delete("/:postID", async (request, response) => {
    response.json(await deletePost(request.params.postID));
});

module.exports = router;