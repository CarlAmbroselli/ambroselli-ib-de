---
---
{% include_relative backend.js %}

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
        '        <div class="background" style="background-image: url(\'' + getThumbnail(reference.background.path, 1200) + '\'); opacity: '+ reference.transparency + '"></div>' +
        '        <h2>' + reference.ueberschrift + '</h2>' +
        '        <p>' + reference.text + '</p>' +
        '    </div>' +
        '</div>'
        )

    document.querySelector('.references-page').appendChild(projectElement)
}

loadReferences()