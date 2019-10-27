var backend = 'https://anpassen.ambroselli-ib.de'
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

function loadReferences() {
    loadJSON(backend + '/api/collections/get/bauherren', function(result) {
        backendReponse = result.entries;
        // document.querySelector('.references-page').innerHTML = ''
        result.entries.forEach(function(element, index) {
            createReference(element, index)
        })
    })
}

function createReference(reference) {
    var projectElement = createElementFromHTML(
        '<div class="reference">' +
        '    <p class="date">' + reference.datum + '</p>' +
        '    <div class="text">' +
        '        <h2>' + reference.ueberschrift + '</h2>' +
        '        <p>' + reference.text + '</p>' +
        '    </div>' +
        '</div>'
        )

    document.querySelector('.references-page').appendChild(projectElement)
}

loadReferences()