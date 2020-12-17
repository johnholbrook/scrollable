const Scrollable = require("../scrollable/scrollable.js");
const {ipcRenderer} = require('electron');
const csvToArray = require("convert-csv-to-array").convertCSVToArray;

function range(start, end) {
    return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
}

var table;
document.addEventListener("DOMContentLoaded", () => {
        table = new Scrollable(document.querySelector("#test"), {
        "extraClasses" : "table table-striped table-borderless",
    });

    ipcRenderer.on("set-data", (event, data) => {
        // this csvToArray will fail if the string doesn't end in a newline ¯\_(ツ)_/¯
        if (data.data.slice(-1) != "\n") data.data += "\n";
        let arrayData = csvToArray(data.data, {
            type: "array",
            separator: ","
        });
        table.setTable(arrayData, data.firstRowHeader);
        table.start();
    });

    ipcRenderer.on('set-imgs', (event, data) => {
        table.setImages(data);
    });

    ipcRenderer.on("set-scroll-speed", (event, data) => {
        table.updateOptions({speed: data});
    });

    ipcRenderer.on("set-framerate", (event, data) => {
        table.updateOptions({fps: data});
    });

    ipcRenderer.on('set-font-size', (event, data) => {
        document.querySelector(":root").style.setProperty("--table-font-size", `${data/2}em`)
    });

    ipcRenderer.on('set-appearance', (event, data) => {
        if (data == "dark"){
            document.querySelector("body").style.backgroundColor = "var(--bs-dark)";
            table.updateOptions({extraClasses: "table table-striped table-borderless table-dark"});
        }
        else{
            document.querySelector("body").style.backgroundColor = "var(--bs-light)";
            table.updateOptions({extraClasses: "table table-striped table-borderless"});
        }
    });

    ipcRenderer.on('set-sticky-header', (event, data) => {
        table.updateOptions({showStickyHeaders: data});
    });
});