const { remote } = require('electron');
var displayWindow = remote.getGlobal('displayWindow');

// returns true if a file name corresponds to a known image type
function isImage(name){
    let extension = name.split(".").slice(-1)[0];
    const image_extensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    return image_extensions.indexOf(extension) > -1
}

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // load data from file
    document.querySelector("#data-file").onchange = () => {
        document.querySelector("#data-file").files[0].text().then(text => {
            document.querySelector("#table-data-input").value = text;
        });
    };

    // save data to file
    document.querySelector("#save-to-file").onclick = () => {
        download(document.querySelector("#table-data-input").value, "data.csv", "text/plain");
    };
    
    // send data to display window
    document.querySelector("#apply-data").onclick = () => {
        displayWindow.webContents.send("set-data", document.querySelector("#table-data-input").value);
    };

    // update images when new directory is selected
    document.querySelector("#image-directory").onchange = () => {
        // get the files from the picker and keep only the image files
        let files = [];
        let fileList = document.querySelector("#image-directory").files;
        for (let i=0; i<fileList.length; i++){
            if (isImage(fileList[i].name)){
                files.push(fileList[i].path);
            }
        }

        // sort files by ascii name
        files.sort();

        // Send file list to display window
        displayWindow.send("set-imgs", new_list);

        // set content of "Image Order" card
        document.querySelector("#image-ordering").innerHTML = ""
        files.forEach(file_path => {
            let tmp = document.createElement("div");
            tmp.setAttribute("path", file_path);
            // tmp.className = "logo-draggable-element";
            tmp.className = "card image-draggable-element";
            let file_name = file_path.split(/[\/\\]/).pop(); //split on either-direction slash
            tmp.innerHTML = `<div class="card-body">
                                <img class="image-preview" src="${file_path}">
                                <span style="margin:0.5em;"></span>
                                <b>${file_name}</b>
                             </div>
                            `;
            document.querySelector("#image-ordering").appendChild(tmp);
        });

        // make image previews draggable to reorder
        let sortable_list = document.querySelector("#image-ordering");
        var sortable = Sortable.create(sortable_list, {
            onSort: function(evt){
                let new_list = []
                for (let child of evt.to.children){
                    new_list.push(child.getAttribute("path"));
                }
                console.log(new_list);
                displayWindow.send("set-imgs", new_list);
            }
        });
    };

    // change scroll speed
    document.querySelector("#scroll_speed").oninput = () => {
        let val = document.querySelector("#scroll_speed").value;
        document.querySelector("#current_scroll_speed").innerHTML= `${val} px/s`;
        displayWindow.webContents.send("set-scroll-speed", val);
    };

    // change font size
    document.querySelector("#font_size").oninput = () => {
        let val = document.querySelector("#font_size").value;
        document.querySelector("#current_font_size").innerHTML = val;
        displayWindow.webContents.send("set-font-size", val);
    };

    // change frame rate
    document.querySelector("#framerate").oninput = () => {
        let val = document.querySelector("#framerate").value;
        document.querySelector("#current_framerate").innerHTML = `${val} FPS`;
        displayWindow.webContents.send("set-framerate", val);
    };

    // set light mode
    document.querySelector("#appearance-light").onclick = () => {
        displayWindow.webContents.send("set-appearance", "light");
    }

    // set dark mode
    document.querySelector("#appearance-dark").onclick = () => {
        displayWindow.webContents.send("set-appearance", "dark");
    }

    // first row is header
    document.querySelector("#first-row-header").onclick = () => {
        displayWindow.webContents.send("set-header", true);
    }

    // first row is data
    document.querySelector("#first-row-data").onclick = () => {
        displayWindow.webContents.send("set-header", false);
    }
});