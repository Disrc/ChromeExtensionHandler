/*global chrome*/
"use strict";

chrome.runtime.onInstalled.addListener(() => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    }
})

chrome.runtime.onMessage.addListener(function(message) {
    // Misc Code Here


    // -=- Don't Modify
    if (message.includes('cached')) {
        let target = 'https://' + message.replaceAll('cached ', '') + '/?cache';
        chrome.tabs.query({
            url: target
        }, function(tabs) {
            for (let i = 0; i < tabs.length; i++) {
                chrome.tabs.remove(tabs[i].id);
            }
        });

    } else if (message.includes('cache')) {
        let target = 'https://' + message.replaceAll('cache ', '') + '/?cache';
        chrome.tabs.create({
            url: target,
            active: false,
            selected: false
        });

    } else if (message.includes('reload')) {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tabs) {
            for (let i = 0; i < tabs.length; i++) {
                chrome.tabs.reload(tabs[i].id);
            }
        });
    }
    // -=- Don't Modify
});
