'use strict';

const got = require('got');
const ora = require('ora');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
let data = '';
let foundMedia = [];

const loadingText = 'Oldal betöltése... ';
const loadingFailedText = 'Oldal betöltése sikertelen!';
const parsingFailedText = 'Videó URL kinyerése sikertelen!';

function load(url) {
    data = '';

    const spinner = ora(loadingText).start();
    return got(url, {
        headers: {
            'user-agent': userAgent
        }
    })
    /*
    .on('downloadProgress', data => {
        // Debug: console.log('downloadProgress', data);
        spinner.text = loadingText + '(' + Math.floor(data.percent * 100) + '%)';
    })
    */
    .then(res => {
        // Debug: console.log('got:res.body.length', res.body.length);
        data = res.body || '';
        return parse();
    })
    .then(re => {
        if (Array.isArray(re) && re.length > 0) {
            spinner.succeed();
        } else {
            spinner.fail(parsingFailedText);
        }
        return re;
    })
    .catch(err => {
        console.error(err.message);
        spinner.fail(loadingFailedText);
    });
}

module.exports.load = load;

function parse() {
    foundMedia.length = 0;

    const splitData = data.split('"full_physical_path":"');
    splitData.forEach(chunk => {
        if (chunk.indexOf('https') === 0) {
            foundMedia.push(chunk.split('"')[0].replace(/\\u002F/g, '/'));
        }
    });

    foundMedia = foundMedia.filter(m => {
        return (m.indexOf('_drmnp.ism/') === -1);
    });

    if (foundMedia.length === 0) {
        console.error(parsingFailedText);
    }

    return foundMedia;
}

module.exports.parse = parse;
