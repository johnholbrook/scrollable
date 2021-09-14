const { remote, ipcRenderer, ipcMain } = require('electron');
var displayWindow = remote.getGlobal('displayWindow');
const csvToArray = require("convert-csv-to-array").convertCSVToArray;
var ip = require("ip");

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

function range(i){
    return [...Array(i).keys()];
}

document.addEventListener("DOMContentLoaded", () => {
    // initialize editable table object
    $('#table-data-input').editableTableWidget();
    
    // buttons to add or subtract columns and rows
    document.querySelector("#add-row").onclick = () => {
        let new_row = document.createElement("tr");
        let num_cols = document.querySelector("#table-data-input tr").childElementCount;
        range(num_cols).forEach(_i => {
            new_row.innerHTML += "<td>&nbsp;</td>";
        });
        document.querySelector("#table-data-input tbody").appendChild(new_row);
        $('#table-data-input').editableTableWidget();
    };
    document.querySelector("#sub-row").onclick = () => {
        let tbody = document.querySelector("#table-data-input tbody");
        tbody.removeChild(tbody.lastElementChild);
    };
    document.querySelector("#add-col").onclick = () => {
        document.querySelectorAll("#table-data-input tr").forEach(row => {
            let new_col = document.createElement("td");
            new_col.innerHTML = "&nbsp;";
            row.appendChild(new_col);
        });
        $('#table-data-input').editableTableWidget();
    };
    document.querySelector("#sub-col").onclick = () => {
        document.querySelectorAll("#table-data-input tr").forEach(row => {
            row.removeChild(row.lastElementChild);
        });
    };

    // load data from file
    document.querySelector("#data-file").onchange = () => {
        document.querySelector("#data-file").files[0].text().then(csv_data => {
            // convert the CSV data to an array
            // this csvToArray will fail if the string doesn't end in a newline ¯\_(ツ)_/¯
            if (csv_data.slice(-1) != "\n") csv_data += "\n";
            let arrayData = csvToArray(csv_data, {
                type: "array",
                separator: ","
            });

            // build and display a table from the array data
            let new_tbody = document.createElement("tbody");
            arrayData.forEach(row => {
                let new_tr = document.createElement("tr");
                row.forEach(item => {
                    new_tr.innerHTML += `<td>${item}</td>`;
                });
                new_tbody.appendChild(new_tr);
            });
            document.querySelector("#table-data-input table").innerHTML = new_tbody.outerHTML;
            $('#table-data-input').editableTableWidget();
        });
    };

    // save data to file
    document.querySelector("#save-to-file").onclick = () => {
        let csv_output = "";
        document.querySelectorAll("#table-data-input tr").forEach(row => {
            row.querySelectorAll("td").forEach((col, i, arr) => {
                csv_output += `"${col.innerText}"`;
                if (i < arr.length-1) csv_output += ",";
            });
            csv_output += "\n";
        });
        download(csv_output, "data.csv", "text/plain");
    };
    
    // send data to display window
    document.querySelector("#apply-data").onclick = () => {
        let arrayData = [];
        document.querySelectorAll("#table-data-input tr").forEach(row => {
            let tmp = [];
            row.querySelectorAll("td").forEach(col => {
                tmp.push(col.innerText);
            });
            arrayData.push(tmp);
        });


        ipcRenderer.send("set-data", {
            data: arrayData,
            firstRowHeader: document.querySelector("#first-row-header").checked
        });
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
        // displayWindow.send("set-imgs", files);
        ipcRenderer.send("set-imgs", files);

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
                // displayWindow.send("set-imgs", new_list);
                ipcRenderer.send("set-imgs", new_list);
            }
        });
    };

    // change scroll speed
    document.querySelector("#scroll_speed").oninput = () => {
        let val = document.querySelector("#scroll_speed").value;
        document.querySelector("#current_scroll_speed").innerHTML= `${val} px/s`;
        ipcRenderer.send("set-scroll-speed", val);
    };

    // change font size
    document.querySelector("#font_size").oninput = () => {
        let val = document.querySelector("#font_size").value;
        document.querySelector("#current_font_size").innerHTML = val;
        ipcRenderer.send("set-font-size", val);
    };

    // change frame rate
    document.querySelector("#framerate").oninput = () => {
        let val = document.querySelector("#framerate").value;
        document.querySelector("#current_framerate").innerHTML = `${val} FPS`;
        ipcRenderer.send("set-framerate", val);
    };

    // set light mode
    document.querySelector("#appearance-light").onclick = () => {
        ipcRenderer.send("set-appearance", "light");
    }

    // set dark mode
    document.querySelector("#appearance-dark").onclick = () => {
        ipcRenderer.send("set-appearance", "dark");
    }

    // show sticky header
    document.querySelector("#sticky-header").onclick = () => {
        ipcRenderer.send("set-sticky-header", true);
    }

    // don't show sticky header
    document.querySelector("#no-sticky-header").onclick = () => {
        ipcRenderer.send("set-sticky-header", false);
    }

    // launch display window
    document.querySelector("#launch-disp-window").onclick = () => {
        ipcRenderer.send("launch-disp-window");
    };

    // copy localhost address
    document.querySelector("#copy-localhost").onclick = () => {
        navigator.clipboard.writeText("http://localhost:8080");
    };

    // write local IP address
    document.querySelector("#local-ip").innerHTML = `http://${ip.address()}:8080`;

    // copy local IP
    document.querySelector("#copy-ip").onclick = () => {
        navigator.clipboard.writeText(`http://${ip.address()}:8080`);
    };

});