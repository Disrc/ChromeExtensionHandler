/*global chrome*/
"use strict";

let targetUrls = ['example.com', 'example.org'];

function cacheSiteOptions(url) {
    chrome.storage.sync.get([`${url}-options`, `global-options`],
        function(out) {
            let target = (out[`${url}-options`] || []).concat(out[`global-options`] || []);

            chrome.storage.sync.get(target,
                function(val) {
                    for (let i = 0; i < target.length; i++) {
                        const v = target[i];
                        localStorage.setItem(v, val[v]);
                    }

                    localStorage.setItem(`cached-${url}`, true);
                    if (window.location.href.includes('?cache')) {
                        chrome.runtime.sendMessage(`cached ${url}`);
                    } else {
                        chrome.runtime.sendMessage('reload');
                    }
                }
            );
        }
    );
}

function getIfActiveUrl(url) {
    for (var i = 0; i < targetUrls.length; i++) {
        if (url.includes(targetUrls[i])) {
            return targetUrls[i];
        }
    }

    return '';
}

const url = getIfActiveUrl(window.location.href);
if (url) {
    // Target-site fetching [Faster]
    if (window.location.href.includes('?cache') || !localStorage.getItem(`cached-${url}`)) {
        window.onbeforeunload = function() {
            return true;
        };

        cacheSiteOptions(url);
    }
} else {
    // Multi-site fetching [Slower]
    chrome.storage.sync.get([`global-options`],
        function(out) {
            let target = out[`global-options`] || [];

            chrome.storage.sync.get(target,
                function(val) {
                    for (let i = 0; i < target.length; i++) {
                        const v = target[i];
                        localStorage.setItem(v, val[v]);
                    }
                }
            );
        }
    );
}
