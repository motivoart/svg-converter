/**
* Plugin finds all svg files in an <img> tag and converts to svg inline 
https://webdesign.tutsplus.com/tutorials/accessible-svg-methods-for-adding-alternative-content--cms-32205
*/

class PluginSVGConverter {
    /**
     * @constructor
     */
    constructor(options = {}) {
        // Default options init with if not overrided by given options
        this.defaultOptions = {
            // Attr by which all img will be searched in DOM
            attrImgElement: '[data-item="svg"]',
            
            // Attr by which all inputs will be searched in DOM
            attrTitle: 'data-title',
            
            // Attr by which all inputs will be searched in DOM
            attrDescription: 'data-description',
        }

        // Override default options with given
        this.options = Object.assign(this.defaultOptions, options);


	    // Init all basic functionalities 
        this.init();
    }
 
    /**
     * Init svg converter functionalities
     */
    init() {
        // Find all svg images with given attr
        const svgImages = document.querySelectorAll(this.options.attrImgElement);

        // Check if any svg have been found
        if (svgImages.length > 0) {

            // If true, handle to every svg images
            svgImages.forEach(svgImage => {
                // Check if handler for this svg image has been already added
                if(svgImage.getAttribute("data-svg-init") != "true") {
                    // Set attr that is not initialized
                    svgImage.setAttribute("data-svg-init", "true");

                    // Init function to handle svg image
                    this.handleSVGImage(svgImage);
                }
            });
	    }
	    else {
		   console.error("#PluginSVGConverter ERROR! Missing elements to properly init svg converter");
	    }

    }

    /**
     * Handle svg converter functionalities for single image
     * @param {HTMLElement} svgImage - single svgimage
     */
     handleSVGImage(svgImage) {
        let img = svgImage;
        let method = 'GET';

        // get image attributes
        let imgURL = img.getAttribute("src");

        this.loadData(method, imgURL, img)
        .then(function (res) {
            console.log('ok');
        }).catch(function (err) {
            console.log('Coś poszło nie tak');
        });
        
    } 

    loadData(method, imgURL, img) {
        return new Promise(function (resolve, reject) {
            fetch(imgURL)
            .then(response => response.text())
            .then(data => {

                convertData(img, data);
            });

            function convertData(img, data) {
                
                // get image attributes
                let imgID = img.getAttribute("id");
                let imgClass = img.getAttribute("class");
                let imgURL = img.getAttribute("src");
                let imgTitle = img.getAttribute("data-title");
                let imgDescription = img.getAttribute("data-description");
                let svgGradient = img.getAttribute("data-svg-gradient");
                let svgGradientStopColors = img.getAttribute("data-svg-gradient-stop-colors");
                let svgGradientStopOffsets = img.getAttribute("data-svg-gradient-stop-offsets");

                // Create a new dom parser to turn the SVG string into an element.
                const parser = new DOMParser();
        
                // Turn the raw text into a document with the svg element in it.
                const parsed = parser.parseFromString(data, 'text/html');
        
                // Select the <svg> element from that document.
                const svg = parsed.querySelector('svg');

                // Store the SVG namespace for easy reuse.
                const xmlns = svg.getAttribute('xmlns');
                const newSvg = document.createElementNS(xmlns, 'svg');

                // Assign a attribute to the `<svg>` element so that it is visible.
                newSvg.setAttribute('xmlns', xmlns);
                newSvg.setAttribute('xmlns:xlink', svg.getAttribute('xmlns:xlink'));
                svg.getAttribute('x') && newSvg.setAttribute('x', svg.getAttribute('x'));
                svg.getAttribute('y') && newSvg.setAttribute('y', svg.getAttribute('y'));
                newSvg.setAttribute('viewBox', svg.getAttribute('viewBox'));
                newSvg.setAttribute('style', svg.getAttribute('style'));
                newSvg.setAttribute('xml:space', svg.getAttribute('xml:space'));

                // generate random number
                let number = Math.floor(Math.random() * 100);

                // if defined image id
                if (typeof imgID !== 'undefined' && imgID) {
                    newSvg.id = imgID;
                }

                // if defined image class
                if (typeof imgClass !== 'undefined') {
                    newSvg.classList.add('replaced-svg');
                    newSvg.classList.add(imgClass);
                }

                // if defined image title
                if (typeof imgTitle !== 'undefined' && imgTitle) {
                    const title = document.createElement("title");
                    title.innerText = imgTitle;
                    title.setAttribute('id', imgClass == null ? 'title'+number : imgClass+number );
                    newSvg.prepend(title);
                }

                // if defined image description
                if (typeof imgDescription !== 'undefined' && imgDescription) {
                    const desc = document.createElement("desc");
                    desc.innerText = imgDescription;
                    desc.setAttribute('id', imgClass == null ? 'desc'+number : imgClass+number );
                    newSvg.prepend(desc);
                }

                newSvg.removeAttribute('xmlns:a');

                newSvg.setAttribute('role', 'img');
                newSvg.setAttribute('aria-labelledby', imgClass == null ? 'title'+number : imgClass+number);

                if (!newSvg.hasAttribute('viewBox') && newSvg.hasAttribute('height') && newSvg.hasAttribute('width')) {
                    newSvg.setAttribute('viewBox', '0 0 ' + newSvg.getAttribute('height') + ' ' + newSvg.getAttribute('width'))
                }

                // Add gradient
                if (svgGradient) {

                    const defs = document.createElementNS(xmlns, 'defs');
                    const gradient = document.createElementNS(xmlns, `${svgGradient}`);
    
                    const colors = svgGradientStopColors.split(',');
                    const offsets = svgGradientStopOffsets.split(',');
                    
                    colors.forEach((color, index) => {
                        const el = document.createElementNS(xmlns, 'stop');
                        el.setAttribute('stop-color', color);
                        if(offsets[index]) {
                            el.setAttribute('offset', offsets[index]);
                        }
                      
                        // Add the `<stop>` element to `<linearGradient>`.
                        gradient.appendChild(el);
                    });
    
                    gradient.id = 'Gradient';
                    gradient.setAttribute('x1', '0');
                    gradient.setAttribute('x2', '1');
                    gradient.setAttribute('y1', '0');
                    gradient.setAttribute('y2', '1');
                    defs.appendChild(gradient);
                                            
                    // Set up the `<rect>` element.
                    newSvg.setAttribute('fill', 'url(#Gradient)');
                                                                    
                    // Add the `<defs>` and `svg body` elements to `<svg>`.
                    newSvg.insertAdjacentElement('afterbegin', defs);
                }

                const body = svg.innerHTML;
                newSvg.insertAdjacentHTML('afterbegin', body);

                if (img !== null && newSvg !== null) {
                    img.replaceWith(newSvg);
                    img.style.opacity = 1;
                }
        
                

            }

        });
    }
}

window.addEventListener('load', () => {
    // Get all svg list that need to use this functionality
    const svgImages = document.querySelectorAll(`[data-item="svg"]`);
    
    if (svgImages.length > 0) {
           
         // Init functionality for every element
         new PluginSVGConverter(svgImages);
    }
 });

 export default PluginSVGConverter;




