'use strict';

const inquirer = require('inquirer');
const cmdArgs = require('minimist')(process.argv.slice(2));

const dateObj = new Date();
let defaultFileName = String(dateObj.getTime() / 1000);

function parseCmdArgs() {
    return new Promise((resolve, reject) => {
        if (!Object.prototype.hasOwnProperty.call(cmdArgs, 'url')) {
            return reject(new Error('Nem lett megadva oldal link!'));
        }

        const urlCheck = isValidURL(String(cmdArgs.url));
        if (urlCheck !== true) {
            return reject(new Error(urlCheck));
        }

        if (!Object.prototype.hasOwnProperty.call(cmdArgs, 'output') || !isValidFileName(String(cmdArgs.output))) {
            cmdArgs.output = parseFileNameFromRtlMostUrl(cmdArgs.url);
        }

        const fileName = createProperFileName(String(cmdArgs.output));

        return resolve({url: cmdArgs.url, file: fileName});
    });
}

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
            filter: createProperFileName
        }])
        .then(params2 => {
            return {url: params1.url, file: params2.file};
        });
    })
    .catch(err => {
        console.error(err.message);
        throw new Error('Hiba az adatok bekérésénél!');
    });
}

module.exports.showPrompts = showPrompts;

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
        console.error(err.message);
        throw new Error('Hiba az adatok bekérésénél!');
    });
}

module.exports.showMediaSelector = showMediaSelector;

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
}

function createProperFileName(fileName) {
    if (!fileName) {
        fileName = String(dateObj.getTime() / 1000);
    }

    if (!fileName.slice(-4) === '.mp4') {
        return fileName;
    }

    return fileName + '.mp4';
}
