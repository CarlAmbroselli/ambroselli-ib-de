---
---
{% include_relative backend.js %}

var backendResponse = [];
var currentIndex = 0;
var iterationInterval = 4000;
var firstRun = true;

function createStyle(index) {
    return "z-index: " + (1000-index)  + '; background-image: url("' + getThumbnail(backendResponse[index].path, 1800) + '")';
}

function show(element) {
    element.className = element.className.replace(" hidden", "")
}

function hide(element) {
    if (element.className.indexOf('hidden') == -1) {
        element.className = element.className + " hidden"
    }
}

function hideAllOther(index) {
    var images = document.querySelectorAll(".slideshow .image");
    for (i = 0; i < images.length; ++i) {
        var image = images[i]
        var id = image.id.replace("image-", "");
        (id == "" + index) ? show(image) : hide(image)
    }
}

function updatePicture() {
    var imageContainer = document.querySelector(".slideshow .image#image-" + currentIndex)
    if (!imageContainer) {
        imageContainer = document.createElement('div');
        imageContainer.className = "image";
        imageContainer.id = "image-" + currentIndex;
        hide(imageContainer)
        document.querySelector('.slideshow').appendChild(imageContainer);
    }
    imageContainer.style = createStyle(currentIndex, false);
    var indexToShow = currentIndex
    currentIndex = (currentIndex + 1) % backendResponse.length;
    if (firstRun) {
        hideAllOther(indexToShow)
        firstRun = false
        updatePicture()
    } else {
        window.setTimeout(function() {
            hideAllOther(indexToShow)
        }, iterationInterval)
    }
}

function loadReferences() {
    loadJSON(backend + '/api/collections/get/slideshow', function(result) {
        backendResponse = result.entries[0].photos;
        updatePicture();
        setInterval(updatePicture, iterationInterval)
    })
}

loadReferences()