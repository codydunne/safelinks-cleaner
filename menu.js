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

// Context menu

/*
 * Workaround for Chrome
 */
async function copyToClipboard(text) {
    try {
	await navigator.clipboard.writeText(text);
    }
    catch {
	const textArea = document.createElement('textarea');
	document.body.append(textArea);
	textArea.textContent = text;
	textArea.select();
	document.execCommand('copy');
	textArea.remove();
    }
}


/*
 * Minimal polyfill for Chrome
 */
if (typeof browser === "undefined") {
    var browser = {
	menus: chrome.contextMenus,
	i18n: chrome.i18n,
    }
}

browser.menus.create({
    id: "liu-safelinks-copy",
    title: browser.i18n.getMessage("copyLinkMenuTitle"),
    contexts: ["link"],
    visible: true,
    targetUrlPatterns: ["*://*.safelinks.protection.outlook.com/*"],
});

browser.menus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "liu-safelinks-copy") {
	copyToClipboard(untangleLink(info.linkUrl));
    }
});
