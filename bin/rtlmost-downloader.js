#!/usr/bin/env node

const {setup, parser, downloader} = require('../index.js');


if (process.argv.length > 2) {
    setup.parseCmdArgs().then(function (params){
        download(params);
    }).catch(err => { 
        console.error(err.message); 
    });
}
else {
    setup.showPrompts().then(function (params){
        download(params);
    }).catch(err => {
        console.error(err.message);
    });    
}

function download(params) {
    return parser.load(params.url).then(
        videoUrls => {
            if (Array.isArray(videoUrls) && videoUrls.length > 0) {
                /* Videó fájl választó:
                if (videoUrls.length > 1) {
                    return setup.showMediaSelector(videoUrls, 1).then(
                        selected => {
                            downloader.download(selected.media, params.file);
                        }
                    );
                }
                */

                downloader.download(videoUrls[videoUrls.length - 1], params.file);
            }
        }
    ).catch(err => {
        console.error(err.message);
    });
};
