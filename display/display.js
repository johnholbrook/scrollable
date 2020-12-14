let Scrollable = require("../scrollable/scrollable.js");

function range(start, end) {
    return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
}

var foo;
document.addEventListener("DOMContentLoaded", () => {
    // console.log("Hello World!");
    var data = [];
    range(0, 30).forEach(i => {
        data.push([i, i, i, i, i]);
    });
    
    foo = new Scrollable(document.querySelector("#test"), {
        "extraClasses" : "table table-striped table-borderless",

        // "showStickyHeaders" : true
    });
    
    foo.setTable(data);
    foo.setImages(["/Users/john/Desktop/trl.png"]);
    foo.start();
});