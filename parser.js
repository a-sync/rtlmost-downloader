'use strict';

const got = require('got');
const ProgressBar = require('progressbar');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
let data = '';
let foundMedia = [];

function load(params) {
    data = '';

    const progress = ProgressBar.create().step('Oldal betöltése...').setTotal(100);
    return got(params.url, {
        headers: {
            'user-agent': userAgent
        }
    })
    .on('downloadProgress', data => {
        //console.log('downloadProgress', data);
        progress.setTick(data.percent * 100);
    })
    .then(res => {
        //console.log('got:res.body.length', res.body.length);
        progress.finish();

        data = res.body || '';
        return detect();
    })
    .catch(err => {
        progress.finish();
        console.error('Oldal betöltése sikertelen!', err.message);
    });
}

module.exports.load = load;

function detect() {
    foundMedia.length = 0;

    const splitData = data.split('"full_physical_path":"');
    splitData.forEach(chunk => {
        if (chunk.indexOf('https') === 0) {
            foundMedia.push(chunk.split('"')[0].replace(/\\u002F/g, '/'));
        }
    });

    if (foundMedia.length > 0) {
        return true;
    } else {
        console.error('Videó URL kinyerése sikertelen!');
        return false;
    }
}

module.exports.detect = detect;

function getMediaList() {
    return foundMedia;
}

module.exports.getMediaList = getMediaList;
