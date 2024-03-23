$(function() {
    $('#kt_docs_jstree_basic').on('select_node.jstree', function(e, data) {
        var filePath = data.node.id;
        if (data.node.type === 'file') {
            var fileContent = getFileContent(filePath);
            // Set the fetched content to the CodeMirror editor
            editor.setValue(fileContent);
        }
    });

    function getFileContent(filePath) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", filePath, false); // synchronous request
        xhr.send();
        
        if (xhr.status === 200) {
            return xhr.responseText;
        } else {
            console.error("Failed to fetch file content:", xhr.status);
            return null; // or handle the error accordingly
        }
    }
});