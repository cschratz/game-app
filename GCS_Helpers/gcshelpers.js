// import modules need in this file
require('util');
// import GCS information from index.js file in config folder
const gc = require('../config/index.js');

// set variable to function locate and store items in our GCS bucket
const bucket = gc.bucket(process.env.GCLOUD_BUCKET_NAME); // should be your bucket name

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const uploadImage = (file) => new Promise((resolve, reject) => {
  const { originalname, buffer } = file;

  const blob = bucket.file(originalname.replace(/ /g, '_'));
  const blobStream = blob.createWriteStream({
    resumable: false,
  });
  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    resolve(publicUrl);
  })
    .on('error', (error) => {
      console.error(error);
      reject(error, 'Unable to upload image, something went wrong');
    })
    .end(buffer);
});

module.exports = {
  uploadImage,
};
