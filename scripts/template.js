"use strict";

function templateFunction() {
    console.log('template');
}

function templateFunction2() {
    console.log('template 2');
}

function globalTemplateFunction() {
    console.log('global template');
}

// Options
if (localStorage.getItem('templateoption')) {
    templateFunction();
}

if (localStorage.getItem('templateoption2')) {
    templateFunction2();
}

if (localStorage.getItem('globaltemplateoption')) {
    globalTemplateFunction();
}
