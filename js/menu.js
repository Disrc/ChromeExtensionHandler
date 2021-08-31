/*global chrome, state*/
"use strict";

let targetUrls = ['example.com', 'example.org'];

function checkIfActiveUrl(url) {
    for (var i = 0; i < targetUrls.length; i++) {
        if (url.includes(targetUrls[i])) {
            return true;
        }
    }
}

chrome.tabs.query({
    active: true,
    currentWindow: true
}).then((tabs) => {
    if (!tabs.length) return;
    if (checkIfActiveUrl(tabs[0].url)) {
        state.style.color = '#FF761C';
        state.textContent = 'Active';
    } else if (tabs[0].url.includes('extension://') && tabs[0].url.includes('/html/options.html')) {
        state.style.color = '#15A2FF';
        state.textContent = 'Updating';
    } else {
        state.style.color = '#FFC715';
        state.textContent = 'Passive';
    }
});
