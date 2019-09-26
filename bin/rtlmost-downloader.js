#!/usr/bin/env node
process.title = 'github.com/a-sync/rtlmost-downloader';

const ora = require('ora');

const {setup, parser, downloader} = require('..');

console.log('FIGYELEM!');
console.log('Az rtlmost-downloader fejlesztése nem folytatódik! Helyette használjátok a youtube-dl programot.');
console.log(' ');

if (process.argv.length > 2) {
    setup.parseCmdArgs().then(download).catch(() => {});
} else {
    setup.showPrompts().then(download).catch(() => {});
}

async function download(params) {
    const videoUrls = await parser.load(params.url);
    // Debug: console.debug(JSON.stringify(videoUrls, null, 2));

    if (Array.isArray(videoUrls) && videoUrls.length > 0) {
        const targetUrls = await checkSources(videoUrls);
        // Debug: console.debug(JSON.stringify(targetUrls, null, 2));

        if (process.argv.length > 2 || targetUrls.length > 0) {
            if (targetUrls.length === 0) {
                throw new Error('Nem található letölthető url.');
            }

            return downloader.download(targetUrls.pop(), params.file);
        }

        const selected = await setup.showMediaSelector(videoUrls, 0);
        return downloader.download(selected.media, params.file);
    }
}

async function checkSources(videoUrls) {
    const spinner = ora('Url-ek ellenőrzése...').start();
    const urls = [];

    const targetUrl = videoUrls
        .filter(url => {
            return (url.indexOf('_drmnp.ism/') === -1);
        })
        .find(url => {
            return (url.indexOf('_unpnp.ism/') !== -1);
        });

    if (targetUrl) {
        const targetCheck = await downloader.check(targetUrl);
        if (targetCheck.meta) {
            urls.push(targetUrl);
        }

        if (targetUrl.indexOf('.fr/v1/resource/s/') !== -1) {
            const urlId = targetUrl.split('.fr/v1/resource/s/')[1].split('_unpnp.ism/')[0];
            const videoId = urlId.split('/').pop();

            const hdUrl = 'https://rtlhu.vod.6cloud.fr/' + urlId + '_unpnp.ism/' + videoId + '_.m3u8';

            const hdCheck = await downloader.check(hdUrl);
            if (hdCheck.meta) {
                urls.push(hdUrl);
            }
        }
    }

    if (urls.length === 0) {
        spinner.fail('Nem található letölthető url.');
    } else {
        spinner.succeed(urls.length + ' db letölthető url.');
    }

    return urls;
}

