var http = require('http');
var path = require('path');
var fs = require('fs');
const {ipcMain} = require("electron");

// check if a file at the given path (relative to the display directory) exists
function fileExists(filepath) {
    let p = path.join(__dirname, "..", "display", filepath);
    return fs.existsSync(p);
}

//some special cases
const paths = {
    "/" : "display.html",
    "/lib/bootstrap.min.css" : path.join("..", "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css"),
    "/lib/scrollable.js" : path.join("..", "scrollable", "scrollable.js"),
    "/lib/socket.io.min.js" : path.join("..", "node_modules", "socket.io", "client-dist", "socket.io.min.js"),
    "/lib/socket.io.min.js.map" : path.join("..", "node_modules", "socket.io", "client-dist", "socket.io.min.js.map"),
};

// object to keep track of the user-selected images
var images = {};

const mime_types = {
    "html" : "text/html",
    "css" : "text/css",
    "js" : "text/javascript",
    "png" : "image/png",
    "jpg" : "image/jpeg",
    "jpeg": "image/jpeg",
    "gif" : "image/gif",
    "bmp" : "image/bmp"
};

// create the server
var server = http.createServer(function(req, res) {
    // determine the location of the file to be retrieved based on the request's URL
    let fp;
    let absolute_path = false;
    // if the url is one of the special cases, use the corresponding path
    if (paths.hasOwnProperty(req.url)){
        fp = paths[req.url];
    }
    // otherwise, if the url is an image, use the path to the image
    else if (images.hasOwnProperty(req.url)){
        fp = images[req.url];
        absolute_path = true;
    }
    // otherwise, if the url is the name of a file in /display, use that
    else if (fileExists(req.url)){
        // if the URL is an extant file, return that file
        fp = req.url;
    }
    else{
        // if not, try appending ".html" and see if that's a file
        if (fileExists(`${req.url}.html`)){
            fp = `${req.url}.html`;
        }
        else{
            // if that doesn't work, return the 404 page
            fp = `404.html`;
        }
    }

    // write the header as appropriate
    let ext = fp.split(".").slice(-1)[0];
    if (fp == "404.html"){
        res.writeHead(404, { 'Content-Type': 'text/html' });
    }
    else if (mime_types.hasOwnProperty(ext)){
        res.writeHead(200, { 'Content-Type': mime_types[ext] });
    }
    else{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
    }

    // get the file contents
    if (absolute_path){
        res.write(fs.readFileSync(fp));
    }
    else{
        res.write(fs.readFileSync(path.join(__dirname, "..", "display", fp)))
    }
    res.end();
});

// initialize socket.io
const io = require("socket.io")(server);

// global to keep track of the current state of the display
var display_state = {
    data: "",
    first_row_header: true,
    scroll_speed : 70,
    font_size : 6,
    framerate : 45,
    dark_mode : false,
    sticky_header : true,
    images: []
};

// when a new client connects, send it the display state
io.on('connection', socket => {
    console.log("connection!");
    socket.emit("set-state", JSON.stringify(display_state));
});

// start the server on port 8080
server.listen(8080);


function updateDisplayState(){
    // send the display state to all connected clients
    io.emit("set-state", JSON.stringify(display_state));
}


// when something is changed in the controller window, update the display state
// accordingly and send the new state to all connected clients

ipcMain.on("set-data", function(event, arg){
    display_state.data = arg.data;
    display_state.first_row_header = arg.firstRowHeader;
    updateDisplayState();
});

ipcMain.on("set-scroll-speed", function(event, arg){
    display_state.scroll_speed = arg;
    updateDisplayState();
});

ipcMain.on("set-font-size", function(event, arg){
    display_state.font_size = arg;
    updateDisplayState();
});

ipcMain.on("set-framerate", function(event, arg){
    display_state.framerate = arg;
    updateDisplayState();
});

ipcMain.on("set-appearance", function(event, arg){
    display_state.dark_mode = (arg == "dark");
    updateDisplayState();
});

ipcMain.on("set-sticky-header", function(event, arg){
    display_state.sticky_header = arg;
    updateDisplayState();
});

ipcMain.on("set-imgs", function(event, arg){
    images = {};
    let names = [];
    arg.forEach(img_fp => {
        let fname = `/img/${path.basename(img_fp)}`;
        images[fname] = img_fp;
        names.push(fname);
    });
    display_state.images = names;
    updateDisplayState();
    // console.log(images);
});