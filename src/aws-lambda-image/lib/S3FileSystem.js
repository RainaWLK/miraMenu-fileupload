"use strict";

const ImageData = require("./ImageData");
const aws       = require("aws-sdk");

class S3FileSystem {

    constructor(region) {
        let s3options = {
			useDualstack: true,
            region: region,
            apiVersion: "2006-03-01"
		}
        this.client = new aws.S3(s3options);
    }

    /**
     * Get object data from S3 bucket
     *
     * @param String bucket
     * @param String key
     * @return Promise
     */
    getObject(bucket, key, acl) {
        return new Promise((resolve, reject) => {
            console.log("Downloading: " + key);

            this.client.getObject({ Bucket: bucket, Key: key }).promise().then((data) => {
                if ( "img-processed" in data.Metadata ) {
                    reject("Object was already processed.");
                } else if ( data.ContentLength <= 0 ) {
                    reject("Empty file or directory.");
                } else {
                    resolve(new ImageData(
                        key,
                        bucket,
                        data.Body,
                        { ContentType: data.ContentType, CacheControl: data.CacheControl },
                        acl
                    ));
                }
            }).catch((err) => {
                reject("S3 getObject failed: " + err);
            });
        });
    }

    /**
     * Put object data to S3 bucket
     *
     * @param ImageData image
     * @return Promise
     */
    putObject(image) {
        const params = {
            Bucket:       image.bucketName,
            Key:          image.fileName,
            Body:         image.data,
            Metadata:     { "img-processed": "true" },
            ContentType:  image.headers.ContentType,
            CacheControl: image.headers.CacheControl,
            ACL:          image.acl || "private"
        };

        console.log("Uploading to: " + params.Key + " (" + params.Body.length + " bytes)");

        return new Promise((resolve, reject) => {
            this.client.putObject(params).promise().then(() => {
                resolve(image);                
            }).catch((err) => {
                reject("S3 putObject failed: " + err);
            });
        });
    }

    /**
     * Delete object data from S3 bucket
     *
     * @param ImageData image
     * @return Promise
     */
    deleteObject(image) {
        const params = {
            Bucket: image.bucketName,
            Key:    image.fileName
        };

        console.log("Delete original object: " + params.Key);

        return new Promise((resolve, reject) => {
            this.client.deleteObject(params).promise().then(() => {
                resolve(image);                
            }).catch((err) => {
                reject("S3 deleteObject failed: " + err);
            });
        });
    }
}

module.exports = S3FileSystem;
