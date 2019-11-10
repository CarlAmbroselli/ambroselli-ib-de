---
---
{% include_relative backend.js %}

var backendResponse = []
var currentIndex = 0
var nextImage = new Image()

function updatePicture() {
    document.querySelector(".slideshow").style = 'background-image: url("' + getThumbnail(backendResponse[currentIndex].path, 1800) + '")';
    currentIndex = (currentIndex + 1) % backendResponse.length;
    nextImage.src = getThumbnail(backendResponse[currentIndex].path, 1800);
}

function loadReferences() {
    loadJSON(backend + '/api/collections/get/slideshow', function(result) {
        backendResponse = result.entries[0].photos;
        updatePicture();
        setInterval(updatePicture, 3000)
    })
}

loadReferences()