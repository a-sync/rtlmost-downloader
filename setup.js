'use strict';

const inquirer = require('inquirer');
const cmdArgs = require('minimist')(process.argv.slice(2));

let defaultFileName = '';

function showMediaSelector(videoUrls, selected) {
    const choices = videoUrls.map(c => {
        const m = c.split('?')[0].split('/');
        let n = m.pop();

        if (n.indexOf('Manifest.') === 0) {
            n = m.pop();
        }

        return {
            name: n,
            value: c
        };
    });

    return inquirer.prompt([{
        type: 'list',
        name: 'media',
        message: 'Videó URL',
        default: selected,
        choices
    }])
    .catch(err => {
        console.error('Hiba az adatok bekérésénél!', err.message);
    });
}

module.exports.showMediaSelector = showMediaSelector;

var parseCmdArgs = function () { 
    return new Promise(function (resolve, reject) {
        var parameters = cmdArgs;

        if (!(parameters.hasOwnProperty('url'))) {
            reject({message: 'Nem lett megadva letöltési oldal!'});
        }
        if (isValidURL(parameters.url) != true) {
            reject({message: 'Az alkalmazás csak https://www.rtlmost.hu/* oldalakkal működik!'});
        }
        var url = parameters.url;

        if(!(parameters.hasOwnProperty('output')) || !isValidFileName(parameters.output)) {
            parameters.output = parseFileNameFromRtlMostUrl(parameters.url);
        }
        var filename = createProperFilename(parameters.output);

        resolve({ url: url, file: filename });
    })
};

module.exports.parseCmdArgs = parseCmdArgs;

function showPrompts() {
    return inquirer.prompt([
        {
            name: 'url',
            message: 'Oldal link:',
            validate: isValidURL
        }
    ])
    .then(params1 => {
        /* Ne kérdezzen rá a fájlnévre, csak ha muszáj:
        if (defaultFileName) {
            return {url: params1.url, file: defaultFileName + '.mp4'};
        }
        */

        return inquirer.prompt([{
            name: 'file',
            message: 'Fájl név:',
            default: defaultFileName,
            validate: isValidFileName,
            filter: createProperFilename
        }])
        .then(params2 => {
            return {url: params1.url, file: params2.file};
        });
    })
    .catch(err => {
        console.error('Hiba az adatok bekérésénél!', err.message);
    });
}

module.exports.showPrompts = showPrompts;

function parseFileNameFromRtlMostUrl(url) {
    let tmp = url.split('-c_');

    if (Array.isArray(tmp) && tmp.length > 1) {
        tmp = tmp[0].split('/').pop();

        if (isValidFileName(tmp)) {
            return tmp;
        }
    }

    return '';
}

function isValidFileName(str) {
    return /^(?!\.)(?!com[0-9]$)(?!con$)(?!lpt[0-9]$)(?!nul$)(?!prn$)[^|*?\\:<>/$"]*[^.|*?\\:<>/$"]+$/.test(str);
}

function isValidURL(url) {
    if (url.indexOf('https://www.rtlmost.hu/') === 0) {
        defaultFileName = parseFileNameFromRtlMostUrl(url);
        return true;
    }

    return 'Az alkalmazás csak https://www.rtlmost.hu/* oldalakkal működik!';
};

function createProperFilename(filename) {
    if (!filename || filename.slice(-4) === '.mp4') {
        return filename;
    }
    return filename + '.mp4';
};