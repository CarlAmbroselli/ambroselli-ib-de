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

function getThumbnail(path, width, quality=100) {
    width = width || 1000;
    if (path.indexOf('/storage/uploads') != 0 && path.indexOf('/anpassen') == -1) {
        path = '/anpassen/storage/uploads' + path
    } else if (path.indexOf('/storage/' == 0)) {
        path = '/anpassen' + path
    }
    path = path.replace('/anpassen/anpassen', '/anpassen')
    return backend + '/api/cockpit/image?token=' + imageToken + '&w=' + width + '&m=thumbnail&o=1&q=' + quality + '&src=' + path
}