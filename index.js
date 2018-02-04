'use strict';

const setup = require('./setup');
const parser = require('./parser');
const downloader = require('./downloader');

// TODO: command line arguments support
setup.showPrompts()
    .then(run)
    .catch(err => {
        console.error('Hiba az adatok bekérésénél!', err.message);
    });

function run(params) {
    parser.load(params).then(success => {
        if (success) {
            // TODO: needs more magic to detect the correct media url (eg. filter for unpnp in string)
            downloader.download(parser.getMediaList()[1], params.file);
        }
    });
}
