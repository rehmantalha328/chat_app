const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const { v4 } = require("uuid");
const { getEnv } = require("../config");
const ID = getEnv("S3_ID");
const SECRET = getEnv("S3_SECRET");
const BUCKET_NAME = getEnv("S3_BUCKET_NAME");

AWS.config.update({
  region: getEnv("S3_REGION"),
});

const s3 = new AWS.S3({
  // Code goes here of configuration s3 bucket
});

let uploadFile = function (file) {
  if (file && file.path) {
    // Upload file code goes here
    };
    // Uploading files to the bucket
    return s3.upload(params).promise();
  return {};
};

let uploadThumbnail = async function (file) {
    if (file && file.thumbnailPath) {
    //  uploading file code goes here
      // Uploading files to the bucket
      return await s3.upload(params).promise();
    }
    return {};
};

const deleteFile = (fileUrl) => {
  if (fileUrl) {
    // remove objects from s3
    };
    return s3.deleteObject(params).promise();
  return {};
};

module.exports = { uploadFile, deleteFile, uploadThumbnail };
