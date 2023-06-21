// Import configured items from server
const {app, PORT, HOST} = require("./server");

app.listen(PORT, HOST, () => {
    console.log(`Express API is running on PORT: ${PORT}`);
});