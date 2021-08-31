/*global chrome*/
"use strict";

var registeredOptions = [];
var registeredSites = [];
window.onresize = updateScale;
window.onload = updateScale;

function updateScale() {
    if (window.innerWidth / 22 > 70) {
        document.body.style.fontSize = `${window.innerWidth / 22}%`;
    } else {
        document.body.style.fontSize = `70%`;
    }
}

function buildOptionList(id, inputs, status) {
    let optionList;
    if (status) {
        optionList = `<select id=${id}>`;
    } else {
        optionList = `<select id=${id} disabled = "true>"`;
    }

    for (let i = 0; i < inputs.length; i++) {
        optionList += `<option value="${inputs[i].toLowerCase()}" id="${id}-${inputs[i].toLowerCase()}">${inputs[i]}</option>`;
    }
    optionList += '</select>';
    return optionList;
}

function buildInputField(id, inputs, status, args) {
    let defaultValue = inputs[0];
    let str;
    if (status) {
        str = `<input id=${id} `;
    } else {
        str = `<input id=${id} disabled="true"`;
    }

    if (args['min']) {
        str += `min="${args['min']}" `;
    }

    if (args['max']) {
        str += `max="${args['max']}" `;
    }

    return (str + `type="${args['type']}" value="${defaultValue}"></input>`);
}

function registerSiteOption(id, site) {
    if (site) {
        if (!registeredSites.includes(site)) {
            registeredSites.push(site);
        }

        let target = `${site}-options`;
        chrome.storage.sync.get(target, function(out) {
            let items = out[target] || [];
            if (items.includes(id)) {
                return;
            }

            items.push(id);
            let save = {}
            save[target] = items;
            chrome.storage.sync.set(save, function() {});
        });
    } else {
        let target = `global-options`;
        chrome.storage.sync.get(target, function(out) {
            let items = out[target] || [];
            if (items.includes(id)) {
                return;
            }

            items.push(id);
            let save = {}
            save[target] = items;
            chrome.storage.sync.set(save, function() {});
        });
    }
}

function registerNewOption(module, id, inputs, name, desc, status, site, style = 'main', type = 'select', args = []) {
    let target = document.getElementById(`${module}-Options`);
    if (target) {
        let container = document.createElement('div');
        container.classList.add('container');
        container.classList.add(`${style}`);
        let option = '';

        if (type === 'select') {
            option = buildOptionList(id, inputs, status, args);
        } else if (type === 'input') {
            if (args['type']) {
                option = buildInputField(id, inputs, status, args);
            } else {
                option = buildInputField(id, inputs, status, args);
            }
        } else {
            throw new Error(`Type ${type} not found!`);
        }

        if (status == true) {
            container.innerHTML = `<span class="option-name ${style}-name"> ‣ <label for="${id}">${name}:</label></span> <span class="option-con ${style}-con">${option}</span><span class="option-desc ${style}-desc"> » ${desc} <span class="status ${style}-status" title="Option implemented">{Status: <span class="checkmark ${style}-checkmark">✓</span>}</span></span>`;
        } else {
            container.innerHTML = `<span class="option-name ${style}-name"> ‣ <label for="${id}">${name}:</label></span> <span class="option-con ${style}-con">${option}</span><span class="option-desc ${style}-desc"> » ${desc} <span class="status ${style}-status" title="Option not implemented">{Status: <span class="cross ${style}-cross">✗</span>}</span></span>`;
        }

        target.appendChild(container);
        registeredOptions.push(id);
        registerSiteOption(id, site);
    } else {
        throw new Error(`Module ${module} not found!`);
    }
}

// START: Register Options

registerNewOption('TEMPLATE', 'templateoption', ['true', 'false'], 'Template Option 1', 'Just a Template', true, 'example.com');
registerNewOption('TEMPLATE', 'templateoption2', ['true', 'false'], 'Template Option 2', 'Just a Template again', true, 'example.org')
registerNewOption('GLOBAL', 'globaltemplateoption', ['true', 'false'], 'Global Template Option', 'Just a Template', true, '');

// END: Register Options

let subs = document.getElementsByClassName('sub-name')
for (let i = 0; i < subs.length; i++) {
    subs[i].innerHTML = "&emsp;" + subs[i].innerHTML.replace('‣', '•');
}

function saveOptions() {
    var save = {};
    for (let i = 0; i < registeredOptions.length; i++) {
        var value = document.getElementById(registeredOptions[i]).value;
        if (value !== 'false') {
            save[`${registeredOptions[i]}`] = value;
        } else {
            save[`${registeredOptions[i]}`] = '';
        }
    }
    chrome.storage.sync.set(save, function() {});
    if (!displayActive) {
        for (let i = 0; i < registeredSites.length; i++) {
            resetcache(registeredSites[i]);
        }
    }
}

function restoreOptions() {
    setTimeout(function() {
        if (registeredOptions.length > 0) {
            chrome.storage.sync.get(registeredOptions, function(items) {
                for (let i = 0; i < registeredOptions.length; i++) {
                    let item = items[registeredOptions[i]];
                    if (item) {
                        document.getElementById(registeredOptions[i]).value = item;
                    } else if (item == '') {
                        document.getElementById(registeredOptions[i]).value = 'false';
                    }
                }
            });
        }
    }, 4);
}

var displayActive = false;
var allowErase = false;
var updateMulti = 5;

function resetcache(url) {
    chrome.runtime.sendMessage(`cache ${url}`);

    if (!displayActive) {
        allowErase = false;
        setTimeout(() => {
            allowErase = true;
        }, (100 * updateMulti) * 5);
        showUpdate();
    }
}

function showUpdate() {
    var status = document.getElementById('status');
    writeAndErase(status, "«Saving: please wait until the popups close»");
}

function erase(target) {
    if (!allowErase) {
        setTimeout(() => {
            erase(target)
        }, 50);
        return;
    }

    if (!target) {
        return;
    }

    for (let i = 1; i <= 100; i++) {
        setTimeout(() => {
            target.style.opacity = `${100 - i}%`
        }, i * updateMulti)
    }

    setTimeout(() => {
        target.innerText = '';
        displayActive = false;
        window.onbeforeunload = function() {
            return null;
        };
    }, 101 * updateMulti)
}

function writeAndErase(target, write) {
    displayActive = true;
    window.onbeforeunload = function() {
        return true;
    };

    target.innerText = write;
    target.style.opacity = '0%';

    for (let i = 1; i <= 100; i++) {
        setTimeout(() => {
            target.style.opacity = `${i}%`
        }, i * updateMulti)
    }

    setTimeout(() => {
        erase(target);
    }, 101 * updateMulti)
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
setTimeout(saveOptions, 250);
