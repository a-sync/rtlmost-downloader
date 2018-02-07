'use strict';

const inquirer = require('inquirer');

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

function showPrompts() {
    return inquirer.prompt([
        {
            name: 'url',
            message: 'Oldal link:',
            validate: input => {
                if (input.indexOf('https://www.rtlmost.hu/') === 0) {
                    defaultFileName = parseFileNameFromRtlMostUrl(input);
                    return true;
                }

                return 'Az alkalmazás csak https://www.rtlmost.hu/* oldalakkal működik!';
            }
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
            filter: value => {
                if (!value || value.split(-4) === '.mp4') {
                    return value;
                }
                return value + '.mp4';
            }
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
