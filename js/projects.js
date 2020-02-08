---
---
{% include_relative backend.js %}
{% include_relative glide.min.js %}

var activeImageIndex = 0;
var itemsPerLoad = 9;
var activeProjectIndex;
var activeLoadId = ""
var loadedProjects = [];

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

function createDetails(project, index) {
    console.log(project)
    var detailsHeadline = project.subheadline;
    if (project.details_headline) {
        detailsHeadline = project.details_headline;
    }

    var glideId = "glide-" + index;

    var html = 
        '<div class="details" id="project-' + index + '">' +
        '   <div class="close-button" onclick="hideDetails(' + index + ')"></div>' +
        `   <div class="glide" id="${glideId}">
                <div class="glide__track" data-glide-el="track">
                <ul class="glide__slides">
                    ` + 
                        project.gallery.map(item => {
                            //return '<div class="slideshow-image" style="background-image: url(\'' + getThumbnail(project.gallery[0].path, 800)  + '\')"></div>'
                            return '<li class="glide__slide">' + 
                                    '<div class="slideshow-image" style="background-image: url(\'' + getThumbnail(item.path, 800)  + '\')"></div>' + 
                                '</li>'
                        }).join(" ") +
                    `
                </ul>
                </div>
                <div class="glide__arrows" data-glide-el="controls">
                    <button class="glide__arrow glide__arrow--left" data-glide-dir="<">prev</button>
                    <button class="glide__arrow glide__arrow--right" data-glide-dir=">">next</button>
                </div>
                ${createTimeline([0.2,0.5,0.75])}
            </div>

        </div>
    `;

    // var html =
    //     '<div class="details hidden" id="project-' + index + '">' +
    //     '<div class="close-button" onclick="hideDetails(' + index + ')"></div>' +
    //     '            <div class="slideshow">' +
    //     '                <div class="slideshow-container">';
    //     if (project.gallery.length > 0) {
    //      html = html +
    //         '                    <span class="prev arrow" onclick="showPreviousGalleryImage()"></span>' +
    //         '                    <div class="slideshow-image" style="background-image: url(\'' + getThumbnail(project.gallery[0].path, 800) + '\')"></div>' +
    //         '                    <span class="next arrow" onclick="showNextGalleryImage()"></span>';
    //     }

    //     html = html +
    //     '                </div>' +
    //     '            </div>' +
    //     '' +
    //     '            <div class="text">' +
    //     '                <h3 class="details-headline">' + detailsHeadline + '</h3>';

    //     if (project.details_description) {
    //         html = html + '<p class="description">' + project.details_description + '</p>'
    //     };
    //     if (project.construction_start) {
    //         html = html + '<h4 class="construction-start">Baubeginn: ' + project.construction_start + '</h4>'
    //     };
    //     html = html +
    //     '                <div class="links">';

    //     if (project.gallery) {
    //         project.gallery.forEach(function(item, index) {
    //             var date = ''
    //             if (item.meta.date) {
    //                 date = item.meta.date + ' '
    //             }
    //             html += '<span onclick="showGalleryImage(' + index + ')">' + date + item.meta.title + '</span>'
    //             html += '<img src="' + getThumbnail(item.path) + '" class="mobile-image" />'
    //         })
    //     }
    //     html = html +
    //     '                </div>'

    //     if (project.construction_end) {
    //         var start = new Date()
    //         html = html + '<h4 class="construction-end">Fertigstellung: ' + project.construction_end + '</h4>'
    //     };
    //     html = html +
    //     '            </div>' +
    //     '        </div>' +
    //     '    </div>';

    var detailsElement =  detailsElement = createElementFromHTML(html)

    document.querySelector('.projects-page .items').appendChild(detailsElement)
    new Glide('.glide#'+glideId).mount()
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

function createTimeline(indices) {
    return `
    <div class="timeline" data-glide-el="controls[nav]">
        <div class="line"></div>
        ${indices.map((position, index) => {
            return '<button class="dot" data-glide-dir="=' + index + '" style="margin-left: ' + position*100 + '%"></button>'
        }).join(" ")}
    </div>
    `
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
    window.addEventListener('resize', refreshProjectsOrder, false);
    loadAllProjects()
}

main();