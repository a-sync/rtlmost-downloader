'use strict';

const ora = require('ora');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegBin = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegBin.path);

const loadingText = 'Videó letöltése... ';
const loadingFailedText = 'Videó letöltése sikertelen!';

function download(url, file) {
    let spinner = ora({color: 'blue'});
    const procSpinner = ora({spinner: 'bouncingBar'});

    try {
        let videoLength;
        ffmpeg(url)
            .videoCodec('copy')
            .audioCodec('copy')
            .format('mp4')
            /*
            .addOption([
                '-c copy',
                '-bsf:a aac_adtstoasc'
            ])
            */
            .on('start', () => {
                // Debug: console.log('Start command:', cmd);
                spinner.start('Videó ellenőrzése...');
            })
            .on('codecData', data => {
                // Debug: console.log('Codec data:', data);
                videoLength = parseTimeStamp(data.duration);
                spinner.info('V/A: ' + data.video.split(' ')[0] + '/' + data.audio.split(' ')[0] + ' ' + data.duration.split('.')[0]);
                spinner = null;
                procSpinner.start(loadingText + ' 00:00:00 (0%)');
            })
            .on('progress', data => {
                // Debug: console.log('Progress:', data);
                const mark = parseTimeStamp(data.timemark);
                const percent = (videoLength > 0 && mark > 0) ? Math.floor(mark / videoLength * 100) : 0;
                procSpinner.text = loadingText + data.timemark.split('.')[0] + ' (' + String(percent) + '%)';
            })
            .on('error', err => {
                console.error(loadingFailedText, err.message);
                if (spinner) {
                    spinner.fail(loadingFailedText);
                } else {
                    procSpinner.fail(loadingFailedText);
                }
            })
            .on('end', () => {
                procSpinner.succeed();
            })
            .save(file);
    } catch (err) {
        console.error(loadingFailedText, err.message);
    }
}

module.exports.download = download;

function parseTimeStamp(str) {
    let re = 0;

    const tsArr = str.split(':');
    re += parseInt(tsArr[0], 10) * 3600; // Hours
    re += parseInt(tsArr[1], 10) * 60; // Minutes
    re += parseFloat(tsArr[2]); // Seconds

    return Math.floor(re);
}
