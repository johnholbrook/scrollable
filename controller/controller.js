// returns true if a file name corresponds to a known image type
function isImage(name){
    let extension = name.split(".").slice(-1)[0];
    const image_extensions = ["jpg", "jpeg", "png", "gif", "bmp"];
    return image_extensions.indexOf(extension) > -1
}

document.addEventListener("DOMContentLoaded", () => {
    
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
        // displayWindow.send("set-imgs", new_list);

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
            }
        });
    };
});