let AWS = require('aws-sdk');

class S3 {
	constructor(region, bucket){
		this.bucket = bucket;

		let s3options = {
			useDualstack: true,
			region: region
		}

		this.s3 = new AWS.S3(s3options);
	}

	async getS3Obj(file){
		var params = {
			Bucket: this.bucket,
			Key: file
		};

		try {
			let data = await this.s3.getObject(params).promise();
			//res.setHeader("Content-Type", data.ContentType);
			return data.Body;
		}catch(err){
			throw err;
		}
	}

	async uploadToS3(buf, filename, contentType){
		var params = {
			Bucket: this.bucket,
			ACL: "public-read",
			Key: filename,
			ContentType: contentType,
			Body: buf
		};

		try {
			let data = await this.s3.putObject(params).promise();
			console.log("Upload successed: " + data.Location);
			return data;
		}
		catch(err){
			console.log('ERROR MSG: ', err);
			throw err;
		}

	}

	async deleteS3Obj(file){
		var params = {
			Bucket: this.bucket,
			Key: file
		};

		try {
			let msg = await this.s3.deleteObject(params).promise();
			//res.setHeader("Content-Type", data.ContentType);
			return msg;
		}catch(err){
			throw err;
		}

	}

}

exports.S3 = S3;
