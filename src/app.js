import S3 from './s3';
import { getImageInfo } from './image.js';
import Restaurant from './restaurant.js';

//private functions
class ReqData{
    constructor() {
        this.paths = [];
        this.params = {};
		this.queryString = {};
        this.body = {};
		this.binaryBody = null;
		this.type = "json";
    }
}

function makeBinaryReqData(req) {
    let reqData = new ReqData();

    reqData.paths = req.params.resource;
    reqData.params = req.params.path;
	reqData.queryString = req.querystring;

	if(typeof req.body.image == 'string'){
		reqData.binaryBody = Buffer.from(req.body.image, 'base64');
		delete req.body.image;
		reqData.type = "image";
	}
	reqData.body = req.body;
	
    return reqData;
}

async function parseBinaryData(rawdata){
    let jsonData = JSON.parse(rawdata);

    let reqData = makeBinaryReqData(jsonData);
    if(reqData.type == 'image'){
        let imageInfo = await getImageInfo(reqData.body ,reqData.binaryBody);
        //console.log("parseBinaryData return");
        reqData.body = imageInfo;
    }
    return reqData;
}

async function onFileUploaded(event, context){
    const bucket = event.Records[0].s3.bucket.name;
    const filename = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    let s3 = new S3("us-east-1", bucket);

    try {
        let rawdata = await s3.getS3Obj(filename);

        let req = await parseBinaryData(rawdata);
        let cmdObj = new Restaurant(req);
        return await cmdObj.addPicture(req.body, req.binaryBody);

    }
    catch(err){
        const message = `Error getting object ${filename} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        console.log(err);
        throw err;
    }
    

}

exports.onFileUploaded = onFileUploaded;
