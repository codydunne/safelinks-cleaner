// Safe Links Cleaner
// Copyright 2021 David Byers <david.byers@liu.se>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Popups


// Constants controlling popup placement

const maxDistanceFromMouse = 30;   // Max distance from mouse to popup
const belowPreferenceWeight = 1.5; // How much do we prefer below placement
const belowPreferenceMargin = 30;  // How much closer does top need to be to even care


let currentPopupTarget = null;
let hidePopupTimeout = null;


/**
 * Return the popup div element, creating it if necessary.
 * @returns {Element} The popup element.
 */
function getPopup() {
    let popup = document.getElementById(safelinksPopupId);
    if (!popup) {
	popupElementLocked = false;
	popup = document.createElement('div');
	popup.id = safelinksPopupId;
	popup.addEventListener('mouseenter', cancelHidePopup, {passive: true});
	popup.addEventListener('mouseleave', scheduleHidePopup, {passive: true});
	document.body.appendChild(popup);
    }
    return popup;
}


/**
 * Cancel hiding the popup (if it has been scheduled) and set
 * hidePopupTimeout to null.
 */
function cancelHidePopup() {
    if (hidePopupTimeout) {
	clearTimeout(hidePopupTimeout);
	hidePopupTimeout = null;
    }
}


/**
 * Hide the current popup. If there is no popup, one will be created.
 */
function hidePopup() {
    cancelHidePopup();
    getPopup().classList.remove(safelinksPopupVisibleClass);
    currentPopupTarget = undefined;
}


/**
 * Schedule hiding the current popup.
 */
function scheduleHidePopup() {
    if (!hidePopupTimeout) {
	hidePopupTimeout = setTimeout(withoutMutationObserver(hidePopup), 100);
    }
}


/**
 * Get the absolute bounds of an element.
 * @param {Element} elem - The element for which to return bounds.
 * @returns {{top: number, left: number, right: number, bottom:
 *   number}} The top, left, right, and bottom coordinates of the
 *   element.
 */
function getAbsoluteBoundingRect(elem) {
    let rect = elem.getBoundingClientRect();
    let scrollLeft = window.scrollX;
    let scrollTop = window.scrollY;
    return {
	top: rect.top + window.scrollY,
	left: rect.left + window.scrollX,
	bottom: rect.bottom + window.scrollY,
	right: rect.right + window.scrollX,
	height: rect.height,
	width: rect.width
    }
}


/**
 * Get the viewport bounding rectangle relative the document.
 * @returns {object} The bounding rectagle.
 */
function getViewportBoundingRect() {
    return {
	top: window.scrollY,
	left: window.scrollX,
	bottom: window.scrollY + window.innerHeight,
	right: window.scrollX + window.innerWidth,
	height: window.innerHeight,
	width: window.innerWidth
    }
}


/**
 * Show the original URL of a link.
 * @param {MouseEvent} event - The event triggering this handler.
 */
function showOriginalUrl(event) {
    let popup = getPopup();
    cancelHidePopup();
    if (event.target != currentPopupTarget
	|| !popup.classList.contains(safelinksPopupVisibleClass)) {
	currentPopupTarget = event.target;
	popup.textContent = untangleLink(event.target.href);
	popup.style.removeProperty('bottom');
	popup.style.removeProperty('right');

	// Get the bounds of the target and viewport
	let targetBounds = getAbsoluteBoundingRect(event.target);
	let viewportBounds = getViewportBoundingRect();

	console.log('targetBounds', targetBounds); // DEBUG
	console.log('viewportBounds', viewportBounds); // DEBUG

	// Set up the popup and get its initial bounds
	popup.style.left = Math.max(targetBounds.left, window.scrollX) + 'px';
	popup.style.top = '-65535px';
	popup.classList.add(safelinksPopupVisibleClass);
	let popupBounds = getAbsoluteBoundingRect(popup);

	// Determine the initial position of the popup
	let mouseY = event.clientY + window.scrollY;
	let distanceToTop = Math.abs(mouseY - targetBounds.top);
	let distanceToBottom = Math.abs(mouseY - targetBounds.bottom);
	let topIsCloser = (distanceToBottom > belowPreferenceMargin &&
			   distanceToTop * belowPreferenceWeight < distanceToBottom);
	let aboveWouldBeVisible = (targetBounds.top - popupBounds.height) >= viewportBounds.top;
	let belowWouldBeVisible = (targetBounds.bottom + popupBounds.height) <= viewportBounds.bottom;

	console.log({distanceToTop: distanceToTop,	         // DEBUG
		     distanceToBottom: distanceToBottom,         // DEBUG
		     topIsCloser: topIsCloser,		         // DEBUG
		     aboveWouldBeVisible: aboveWouldBeVisible,   // DEBUG
		     belowWouldBeVisible: belowWouldBeVisible}); // DEBUG

	if ((topIsCloser && aboveWouldBeVisible) || !belowWouldBeVisible) {
	    console.log('initial position: top');                // DEBUG
	    popup.style.top = (targetBounds.top - popupBounds.height) + 'px';
	}
	else if ((!topIsCloser && belowWouldBeVisible) || !aboveWouldBeVisible) {
	    console.log('initial position: bottom');             // DEBUG
	    popup.style.top = targetBounds.bottom + 'px';
	}
	else {
	    console.log('initial position: not good');           // DEBUG
	    popup.style.top = targetBounds.bottom + 'px';
	}

	// Get the updated bounds and proceed to adjustments
	popupBounds = getAbsoluteBoundingRect(popup);

	// If the popup is really far from the mouse, move it closer
	if (popupBounds.top - mouseY > maxDistanceFromMouse) {
	    console.log('moving upwards to mouse');              // DEBUG
	    popup.style.top = (mouseY + 2) + 'px';
	    popupBounds = getAbsoluteBoundingRect(popup);
	}
	else if (mouseY - popupBounds.bottom > maxDistanceFromMouse) {
	    console.log('moving downwards to mouse');            // DEBUG
	    popup.style.top = (mouseY - popupBounds.height - 2) + 'px';
	    popupBounds = getAbsoluteBoundingRect(popup);
	}

	// Clamp to bottom of viewport rect
	if (popupBounds.bottom > viewportBounds.bottom) {
	    console.log('clamping to bottom');                   // DEBUG
	    popup.style.top = (viewportBounds.bottom - popupBounds.height) + 'px';
	}

	// Clamp to top of viewport rect
	if (popupBounds.top < viewportBounds.top) {
	    console.log('clamping to top');                      // DEBUG
	    popup.style.top = viewportBounds.top + 'px';
	}

	// Clamp to left of viewport rect
	if (popupBounds.left < viewportBounds.left) {
	    console.log('clamping to left');                     // DEBUG
	    popup.style.left = viewportBounds.left; + 'px';
	}
    }
}
