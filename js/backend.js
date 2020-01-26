var imageToken = "b36f5945dfa236521592b259136ec2";
var backend = 'https://ambroselli-ib.de/anpassen'
var backendReponse = {}

function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
}

function getThumbnail(path, width) {
    width = width || 1000;
    if (path.indexOf('/storage/' == 0)) {
        path = '/anpassen' + path
    }
    return backend + '/cockpit/utils/thumb_url?token=' + imageToken + '&w=' + width + '&m=bestFit&o=1&src=' +  path
}