---
---
{% include_relative backend.js %}
{% include_relative glide.min.js %}

var activeImageIndex = 0;
var itemsPerLoad = 9;
var activeProjectIndex;
var activeLoadId = ""
var loadedProjects = [];
var currentBrowserWidth = document.documentElement.clientWidth;

function loadAllProjects(filter, category='Projekte') {
    highlightActiveLink(filter);
    activeLoadId = generateId()
    loadJSON(backend + '/api/collections/get/' + category, function(result) {
        loadedProjects = result.entries;
        document.querySelector('.projects-page .items').innerHTML = ''
        loadNextProjects(result.entries, category, filter, 0, activeLoadId)
    })
}

function loadNextProjects(remainingProjects, category, filter, offset, currentLoadId) {
    // this is an outdated call, we already clicked a new link
    if (activeLoadId !== currentLoadId) {
        return;
    }
    remainingProjects.slice(0,itemsPerLoad).forEach(function(element, index) {
        if (category !== 'highlights' && filter && filter !== element.category) { return }
        createProject(element, index+offset)
        // createDetails(element, index+offset)
    })
    if (remainingProjects.length > itemsPerLoad) {
        window.setTimeout(function() {
            loadNextProjects(remainingProjects.slice(itemsPerLoad), category, filter, offset+itemsPerLoad, currentLoadId)
        }, 1500);
    }
}

function highlightActiveLink(selection) {
    var items = document.querySelectorAll('.links .item'), i, activeElement;
    if (!selection) {
        selection = 'Alle'
    }

    for (i = 0; i < items.length; ++i) {
        if (items[i].id === 'link-' + selection) {
            items[i].classList = "item active"
        } else {
            items[i].classList = "item"
        }
    }
}

function createProject(project, index) {
    var projectElement = createElementFromHTML(
        '<div class="item" style="order: ' + index + '" id="item-' + index + '" onclick="showDetails(' + index + ')">' +
        '   <img class="picture" src="' + getThumbnail(project.title_picture.path, 640, 50) + '" />' +
        '   <p class="headline">' + project.headline + '</p>' +
        (project.subheadline ? '   <p class="sub-headline">' + project.subheadline + '</p>' : '') + 
        '   <img class="construction-active-arrow hidden" src="/assets/css/arrow.svg" />' +
        '</div>'
    )

    document.querySelector('.projects-page .items').appendChild(projectElement)
}

function parseDate(dateString) {
    if (dateString.split(' ')[0].indexOf('-') > -1) {
        var d = new Date(dateString.split(' ')[0])
        return ("0" + d.getDate()).slice(-2)  + "." + ("0"+(d.getMonth()+1)).slice(-2) + "." + d.getFullYear()
    } else {
        return dateString
    }
}

function pictureTextForPhoto(photo) {
    return parseDate(photo.meta.data || photo.meta.date) + ' ' + photo.meta.title
}

function createDetails(project, index) {
    var detailsHeadline = project.subheadline;
    if (project.details_headline) {
        detailsHeadline = project.details_headline;
    }

    var glideId = "glide-" + index;

    var html = 
        '<div class="details" id="project-' + index + '">' +
        '   <div class="close-button" onclick="hideDetails(' + index + ')"></div>' +
        ' <p class="detailsHeadline">' + detailsHeadline + '</p>' +
        '   <div class="glide" id="' + glideId + '">' +
                '<div class="glide__track" data-glide-el="track">' +
                '<ul class="glide__slides">' +  
                        project.gallery.map(item => {
                            console.log(item)
                            return '<li class="glide__slide">' + 
                                    '<div class="slideshow-image" style="background-image: url(\'' + getThumbnail(item.path, 1600)  + '\')"></div>' + 
                                '</li>'
                        }).join(" ") +
                '</ul>' + 
                '</div>' +
                (project.gallery.length > 0 ? ('<p id="detailPhotoHeadline">' + pictureTextForPhoto(project.gallery[0]) + '</p>') : '') +
                '<div class="glide__arrows" data-glide-el="controls">' +
                    '<button class="glide__arrow glide__arrow--left control-button prev" data-glide-dir="<"><span class="prev arrow"></span></button>' + 
                    '<button class="glide__arrow glide__arrow--right control-button next" data-glide-dir=">"><span class="next arrow"></span></button>' + 
                '</div>' + 
                createTimeline(project) +
                '<p class="construction_start">Baubeginn: ' + parseDate(project.construction_start) + '</p>' +
                '<p class="construction_end">Fertigstellung: ' + parseDate(project.construction_end) + '</p>' +
            '</div>'+
        '</div>';

    var detailsElement =  detailsElement = createElementFromHTML(html)

    document.querySelector('.projects-page .items').appendChild(detailsElement)
    var glide = new Glide('.glide#'+glideId)

    glide.on('run', function (e) {
        var newIndex = glide.index
        highlightCurrentPhoto(newIndex)
      })

    glide.mount()
}

function highlightCurrentPhoto(index) {
    var divs = document.querySelectorAll('.timeline .dot');
    for (i = 0; i < divs.length; ++i) {
        if (divs[i].id === 'dot-index-' + index) {
            divs[i].className = "dot active"
        } else {
            divs[i].className = "dot"
        }
    }

    var photoText = document.querySelector("#detailPhotoHeadline")
    photoText.innerHTML = pictureTextForPhoto(loadedProjects[activeProjectIndex].gallery[index])
}

function showCorrectArrow(index) {
    var divs = document.querySelectorAll('.items .item'), i;

    for (i = 0; i < divs.length; ++i) {
        if (divs[i].id === 'item-' + index) {
            divs[i].querySelector('.construction-active-arrow').className = "construction-active-arrow";
        } else {
            divs[i].querySelector('.construction-active-arrow').className = "construction-active-arrow hidden";
        }
    }
}

function showGalleryImage(index) {
    var gallery = loadedProjects[activeProjectIndex].gallery;
    activeImageIndex = index;
    var image = document.querySelector('.items .details#project-' + activeProjectIndex + ' .slideshow-container .slideshow-image')
    image.style = "background-image: url('" + getThumbnail(gallery[activeImageIndex].path, 800) + "')"
    updateSlideshowArrows()
    highlightActiveSlideshowLink()
}

function showNextGalleryImage() {
    var gallery = loadedProjects[activeProjectIndex].gallery;
    document.querySelector('.slideshow-container .prev.arrow').style = "";
    if (gallery.length > activeImageIndex+1) {
        showGalleryImage(activeImageIndex+1)
    }
}

function showPreviousGalleryImage() {
    if (activeImageIndex > 0) {
        showGalleryImage(activeImageIndex-1)
    }
}

function updateSlideshowArrows() {
    var gallery = loadedProjects[activeProjectIndex].gallery;
    var next = document.querySelector('.details:not(.hidden) .slideshow-container .next.arrow')
    var prev = document.querySelector('.details:not(.hidden) .slideshow-container .prev.arrow')

    if (!next || !prev) {
        return
    }
    if (gallery.length >= activeImageIndex) {
        next.style = ""
    }
    if (gallery.length <= activeImageIndex+1) {
        next.style = "display: none"
    }
    if (activeImageIndex == 0) {
        prev.style = "display: none";
    } else {
        prev.style = "";
    }
    if (gallery.length <= 1) {
        prev.style = "display: none"
        next.style = "display: none"
    }
}

function highlightActiveSlideshowLink() {
    var links = document.querySelectorAll('.details:not(.hidden) .links span');
    for (i = 0; i < links.length; ++i) {
        if (i == activeImageIndex) {
            links[i].className = "active"
        } else {
            links[i].className = ""
        }
    }
}

function getDetailsPosition(index) {
    var items = document.querySelectorAll('.items .item'), i, activeElement;
    var highestIndex = index;

    for (i = 0; i < items.length; ++i) {
        if (items[i].id === 'item-' + index) {
            activeElement = items[i]
        }
    }

    for (i = 0; i < items.length; ++i) {
        if (items[i].id > activeElement.id && items[i].offsetTop == activeElement.offsetTop) {
            highestIndex = parseInt(items[i].id.replace('item-', ''));
        }
    }

    return highestIndex;
}

function showDetails(index, onlyResize) {
    var position = getDetailsPosition(index);
    createDetails(loadedProjects[index], index);
    var divs = document.querySelectorAll('.items .details'), i;
    if (!onlyResize) {
        activeImageIndex = 0;
        activeProjectIndex = index;
    }

    for (i = 0; i < divs.length; ++i) {
        if (divs[i].id === 'project-' + index) {
            divs[i].style = "order: " + position + ";"
            divs[i].className = "details";
        } else {
            divs[i].parentNode.removeChild(divs[i]);
        }
    }

    updateSlideshowArrows()
    highlightActiveSlideshowLink()
    showCorrectArrow(index)
}

function hideDetails(index) {
    console.log("Hide" + index)
    var element = document.querySelector(".items .details#project-" + index);
    if (element) {
        element.parentNode.removeChild(element)
    }
    showCorrectArrow(-1);
}

function calculateOffset(startDate, current, endDate) {
    return (current - startDate) / (endDate - startDate)
}

function createTimeline(project) {
    console.log("create timeline", project, project.construction_end)
    var startDate = dateStringToDate(project.construction_start)
    var endDate = dateStringToDate(project.construction_end)
    var today = new Date()
    var elapsed = calculateOffset(startDate, today, endDate)
    console.log("elapsed", elapsed)

    return '<div class="timeline" data-glide-el="controls[nav]">' + 
     '   <div class="line" style="background: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ' + elapsed*100 + '%, rgba(200,200,200,1) ' + elapsed*100 + '%, rgba(200,200,200,1) 100%)"></div>' + 
        project.gallery.map((item, index) => {
            var pictureDate = dateStringToDate(item.meta.data || item.meta.date)
            var offset = calculateOffset(startDate, pictureDate, endDate)
            return '<button class="dot ' + (index==0 ? 'active' : '') + '" id="dot-index-' + index + '" data-glide-dir="=' + index + '" style="margin-left: ' + offset*100 + '%"></button>'
        }).join(" ") + 
    '</div>'
}

function dateStringToDate(dateString) {
    try {
        dateString = dateString.split(' ')[0]
        if (dateString.indexOf("-") > -1) {
            return new Date(dateString.trim())
        } else {
            return new
             Date(dateString.trim().split('.')[2] + '-' + dateString.trim().split('.')[1] + '-' + dateString.trim().split('.')[0])
        }
    } catch(e) {
        console.error(e, "Failed to parse ", dateString)
        return new Date()
    }
}

function handleResize(e) {
    if (document.documentElement.clientWidth !== currentBrowserWidth) {
        currentBrowserWidth = document.documentElement.clientWidth;
        refreshProjectsOrder()
    }
}

function refreshProjectsOrder() {
    var activeDetails = document.querySelector('.items .details:not(.hidden)')
    if (activeDetails) {
        var index = parseInt(activeDetails.id.replace('project-', ''))
        hideDetails(index)
        showDetails(index, true)
    }
}

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function main() {
    window.addEventListener('resize', handleResize, false);
    loadAllProjects()
}

main();