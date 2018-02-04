'use strict';

const ProgressBar = require('progressbar');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegBin = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegBin.path);
//ffmpeg.setFfprobePath(ffmpegBin.path);

function download(url, file) {
    const progress = ProgressBar.create();
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
        .on('start', cmd => {
            //console.log('Start command:', cmd);
            progress.step('Videó ellenőrzése...');
        })
        .on('codecData', data => {
            //console.log('Codec data:', data);
            progress.step('Videó letöltése...')
                .setTotal(parseTimeStamp(data.duration));
        })
        .on('progress', data => {
            //console.log('Progress:', data);
            progress.setTick(parseTimeStamp(data.timemark));
        })
        .on('error', function(err) {
            progress.finish();
            console.error('Videó letöltése sikertelen!', err.message);
        })
        .on('end', () => {
            progress.finish();
            //console.log('Videó sikeresen letöltve!', file);
        })
        .save(file);
}

module.exports.download = download;

function parseTimeStamp(str) {
    let re = 0;

    const tsArr = str.split(':');
    re += parseInt(tsArr[0], 10) * 3600; // hours
    re += parseInt(tsArr[1], 10) * 60; // minutes
    re += parseFloat(tsArr[2]); // seconds

    return Math.floor(re);
}
