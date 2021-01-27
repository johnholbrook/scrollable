// const Scrollable = require("../scrollable/scrollable.js");
// const {ipcRenderer} = require('electron');
// const csvToArray = require("convert-csv-to-array").convertCSVToArray;

function range(start, end) {
    return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
}

const socket = io();

socket.on('connect', () => {
    console.log("Connected!")
});

socket.on('set-state', (newState) => {
    // console.log(newState);
    setState(JSON.parse(newState));
});

function setState(state){
    console.log(state);

    // set data
    table.setTable(state.data, state.first_row_header);

    // set images
    table.setImages(state.images);

    // set speed, fps, sticky headers
    table.updateOptions({
        speed: state.scroll_speed,
        fps: state.framerate,
        showStickyHeaders : state.sticky_header
    }, false);

    // set font size
    document.querySelector(":root").style.setProperty("--table-font-size", `${state.font_size/2}em`)

    // set light/dark mode
    if (state.dark_mode){
        document.querySelector("body").style.backgroundColor = "var(--bs-dark)";
        table.updateOptions({extraClasses: "table table-striped table-borderless table-dark"}, false);
        document.querySelectorAll(".scrollable-table").forEach(table => {
            table.classList.toggle("table-dark", true);
        });
    }
    else{
        document.querySelector("body").style.backgroundColor = "var(--bs-light)";
        table.updateOptions({extraClasses: "table table-striped table-borderless"}, false);
        document.querySelectorAll(".scrollable-table").forEach(table => {
            table.classList.toggle("table-dark", false);
        });
    }

    if (state.data != []) table.start();
}

var table;
document.addEventListener("DOMContentLoaded", () => {
    table = new Scrollable(document.querySelector("#display-area"), {
        "extraClasses" : "table table-striped table-borderless",
    });
});