#!/usr/bin/env node
const request = require('request');
const fs = require('fs');
const cliProgress = require('cli-progress');
const process = require('process');

const fileUrl = process.argv.slice(2)[0].split('=')[1];

const dl = (url, filename, callback) => {
  const progressBar = new cliProgress.SingleBar(
    {
      format: '{bar} {percentage}% | ETA: {eta}s',
    },
    cliProgress.Presets.shades_classic
  );

  const file = fs.createWriteStream(filename);
  let receivedBytes = 0;

  // Send request to the given URL
  request
    .get(url)
    .on('response', (response) => {
      if (response.statusCode !== 200) {
        return callback('Response status was ' + response.statusCode);
      }

      const totalBytes = response.headers['content-length'];
      progressBar.start(totalBytes, 0);
    })
    .on('data', (chunk) => {
      receivedBytes += chunk.length;
      progressBar.update(receivedBytes, 0);
    })
    .pipe(file)
    .on('error', (err) => {
      fs.unlink(filename);
    });

  file.on('finish', () => {
    progressBar.stop();
    file.close(callback);
  });

  file.on('error', (err) => {
    fs.unlink(filename);
    progressBar.stop();
    return callback(err.message);
  });
};

dl(fileUrl, 'knot.jpg', () => {});
