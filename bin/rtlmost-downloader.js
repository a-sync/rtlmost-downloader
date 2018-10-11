#!/usr/bin/env node
process.title = 'github.com/a-sync/rtlmost-downloader';

const {setup, parser, downloader} = require('..');

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
            // Debug: console.debug(JSON.stringify(videoUrls, null, 2));

            if (Array.isArray(videoUrls) && videoUrls.length > 0) {
                const targetUrl = bestGuess(videoUrls);

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

function bestGuess(videoUrls) {
    const url = videoUrls
        .filter(url => {
            return (url.indexOf('_drmnp.ism/') === -1);
        })
        .find(url => {
            return (url.indexOf('_unpnp.ism/') !== -1);
        });

    if (url && url.indexOf('.fr/v1/resource/s/') !== -1) {
        const urlId = url.split('.fr/v1/resource/s/')[1].split('_unpnp.ism/')[0];
        const videoId = urlId.split('/').pop();

        return 'https://rtlhu.vod.6cloud.fr/' + urlId + '_unpnp.ism/' + videoId + '_.m3u8';
    }

    return url;
}
// TODO: try to download all other URLs if no good target can be found, or the first try fails
