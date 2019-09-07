var backend = 'https://anpassen.ambroselli-ib.de'

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

function loadAllProjects(filter) {
    highlightActiveLink(filter);
    loadJSON(backend + '/api/collections/get/Projekte', function(result) {
        document.querySelector('.projects-page .items').innerHTML = ''
        result.entries.forEach(function(element, index) {
            if (filter && filter !== element.category) { return }
            createProject(element, index)
            createDetails(element, index)
        })
    })
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
        '   <img class="picture" src="' + backend + '/storage/uploads' + project.title_picture.path + '" />' +
        '   <p class="headline">' + project.headline + '</p>' +
        '   <p class="sub-headline">' + project.subheadline + '</p>' +
        '   <img class="construction-active-arrow hidden" src="/assets/css/arrow.svg" />' +
        '</div>'
    )

    document.querySelector('.projects-page .items').appendChild(projectElement)
}

function createDetails(project, index) {
    var detailsHeadline = project.subheadline;
    if (project.details_headline) {
        detailsHeadline = project.details_headline;
    }
    var html =
        '<div class="details hidden" id="project-' + index + '">' +
        '<div class="close-button" onclick="hideDetails(' + index + ')"></div>' +
        '            <div class="slideshow">' +
        '                <div class="slideshow-container">';
        if (project.gallery.length > 0) {
         html = html +
            '                    <span class="prev arrow"></span>' +
            '                    <div class="slideshow-image" style="background-image: url(\'' + backend + project.gallery[0].path+ '\')"></div>' +
            '                    <span class="next arrow"></span>';
        }

        html = html +
        '                </div>' +
        '            </div>' +
        '' +
        '            <div class="text">' +
        '                <h3>' + detailsHeadline + '</h3>';

        if (project.details_description) {
            html = html + '<p class="description">' + project.details_description + '</p>'
        };
        if (project.construction_start) {
            html = html + '<h4>Baubeginn: ' + project.construction_start + '</h4>'
        };
        html = html +
        '                <div class="links">';

        if (project.gallery) {
            project.gallery.forEach(function(item) {
                var date = ''
                if (item.meta.date) {
                    date = item.meta.date + ' '
                }
                html += '<span>' + date + item.meta.title + '</span>'
            })
        }
        html = html +
        '                </div>'

        if (project.construction_end) {
            var start = new Date()
            html = html + '<h4>Fertigstellung: ' + project.construction_end + '</h4>'
        };
        html = html +
        '            </div>' +
        '        </div>' +
        '    </div>';

    var detailsElement =  detailsElement = createElementFromHTML(html)

    document.querySelector('.projects-page .items').appendChild(detailsElement)
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

    return highestIndex+1;
}

function showDetails(index) {
    var divs = document.querySelectorAll('.items .details'), i;

    for (i = 0; i < divs.length; ++i) {
        if (divs[i].id === 'project-' + index) {
            divs[i].style = "order: " + getDetailsPosition(index) + ";"
            divs[i].className = "details";
        } else {
            divs[i].className = "details hidden";
        }
    }

    showCorrectArrow(index)
}

function hideDetails(index) {
    document.querySelector(".items .details#project-" + index).className = "details hidden";
    showCorrectArrow(-1);
}

function refreshProjectsOrder() {
    var activeDetails = document.querySelector('.items .details:not(.hidden)')
    if (activeDetails) {
        var index = parseInt(activeDetails.id.replace('project-', ''))
        hideDetails(index)
        showDetails(index)
    }
}

function main() {
    window.addEventListener('resize', refreshProjectsOrder, false);
    loadAllProjects()
}

main();