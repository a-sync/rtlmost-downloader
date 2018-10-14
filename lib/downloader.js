'use strict';

const ora = require('ora');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegBin = require('ffmpeg-static');
const ffprobeBin = require('ffprobe-static');

ffmpeg.setFfmpegPath(ffmpegBin.path);
ffmpeg.setFfprobePath(ffprobeBin.path);

const loadingText = 'Videó letöltése... ';
const loadingFailedText = 'Videó letöltése sikertelen!';

function download(url, file) {
    return new Promise((resolve, reject) => {
        let spinner = ora({color: 'blue'});
        const procSpinner = ora({spinner: 'bouncingBar'});

        try {
            let videoLength;
            ffmpeg(url)
                .videoCodec('copy')
                .audioCodec('copy')
                .format('mp4')
                /* .addOption([
                    // ,'-c copy'
                    // ,'-bsf:a aac_adtstoasc'
                ]) */
                .on('start', () => {
                    // Debug: console.log('Start command:', cmd);
                    spinner.start('Videó ellenőrzése...');
                })
                .on('codecData', data => {
                    // Debug: console.log('Codec data:', data);
                    videoLength = parseTimeStamp(data.duration);
                    spinner.info('Videó: ' +
                        data.video_details[2].split(' ')[0] + ' ' +
                        data.video_details[3] + ' ' +
                        data.video.split(' ')[0]);
                    spinner.info('Audió: ' +
                        data.audio_details[1] + ' ' +
                        data.audio_details[2] + ' ' +
                        data.audio.split(' ')[0]);
                    spinner.info('Hossz: ' +
                        data.duration.split('.')[0]);
                    spinner = null;
                    procSpinner.start(loadingText + '00:00:00 (0%)');
                })
                .on('progress', data => {
                    // Debug: console.log('Progress:', data);
                    const mark = parseTimeStamp(data.timemark);
                    const percent = (videoLength > 0 && mark > 0) ? Math.floor(mark / videoLength * 100) : 0;
                    procSpinner.text = loadingText + data.timemark.split('.')[0] + ' (' + String(percent) + '%)';
                })
                .on('error', err => {
                    // Debug: console.error(loadingFailedText, err.message);
                    if (spinner) {
                        spinner.fail(loadingFailedText);
                    } else {
                        procSpinner.fail(loadingFailedText);
                    }

                    return reject(new Error(err));
                })
                .on('end', () => {
                    procSpinner.succeed();
                    return resolve();
                })
                .save(file);
        } catch (err) {
            // Debug: console.error(loadingFailedText, err.message);
            return reject(new Error(err));
        }
    });
}

module.exports.download = download;

function check(url) {
    return new Promise(resolve => {
        ffmpeg
            .ffprobe(url, (err, meta) => {
                return resolve({err, meta});
            });
    });
}

module.exports.check = check;

function parseTimeStamp(str) {
    let re = 0;

    const tsArr = str.split(':');
    re += parseInt(tsArr[0], 10) * 3600; // Hours
    re += parseInt(tsArr[1], 10) * 60; // Minutes
    re += parseFloat(tsArr[2]); // Seconds

    return Math.floor(re);
}
