#!/usr/bin/env node
process.title = 'rtlmost-downloader (@a-sync)';

const {setup, parser, downloader} = require('../index.js');

if (process.argv.length > 2) {
    setup.parseCmdArgs()
    .then(download)
    .catch(err => {
        console.error(err.message);
    });
} else {
    setup.showPrompts()
    .then(download)
    .catch(err => {
        console.error(err.message);
    });
}

function download(params) {
    return parser.load(params.url).then(
        videoUrls => {
            if (Array.isArray(videoUrls) && videoUrls.length > 0) {
                const targetUrl = findGoodTarget(videoUrls);

                if (targetUrl || process.argv.length > 2) {
                    downloader.download(targetUrl, params.file);
                } else {
                    return setup.showMediaSelector(videoUrls, 0).then(
                        selected => {
                            downloader.download(selected.media, params.file);
                        }
                    );
                }
            }
        }
    ).catch(err => {
        console.error(err.message);
    });
}

function findGoodTarget(videoUrls) {
    return videoUrls
        .filter(url => {
            return (url.indexOf('_drmnp.ism/') === -1);
        })
        .find(url => {
            return (url.indexOf('_unpnp.ism/') !== -1);
        });
}
// TODO: try to download all other URLs if no good target can be found, or the first try fails
