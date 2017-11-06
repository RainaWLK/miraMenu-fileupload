var mime = require('mime-types');
import gm from 'gm';
const im = gm.subClass({ imageMagick: true });
let S3 = require('./s3.js').S3;
const ImageProcessor = require("./aws-lambda-image/lib/ImageProcessor");
const S3FileSystem   = require("./aws-lambda-image/lib/S3FileSystem");
const Config         = require("./aws-lambda-image/lib/Config");
const ImageData = require("./aws-lambda-image/lib/ImageData");

async function processImage(fileinfo){
  let s3 = new S3(fileinfo.region, fileinfo.bucket);

  let buffer = await s3.getS3Obj(fileinfo.path+fileinfo.name);
  console.log("read file done: "+buffer.length);

  //aws lambda image
  let imageInfo = await runAwsLambdaImage(buffer, fileinfo);

  
  //let imageInfo = await getImageInfo(buffer);
  //console.log("get image info done");
  //console.log(imageInfo);

  //make thumbnails
  //imageInfo.thumbnails = {};
  //for(let type in thumbSize){
  //  let width = thumbSize[type];

  //  let thumbBuffer = await resize(buffer, width);
  //  let thumb_filename = getFileName(imageInfo, fileinfo.resourceid, type);
  //  let thumb_fullpath = fileinfo.path+thumb_filename
  //  imageInfo.thumbnails[type] = thumb_fullpath;

  //  let result = await s3.uploadToS3(thumbBuffer, thumb_fullpath, imageInfo.mimetype);
  //  console.log(result);
  //}


  return imageInfo;
}

async function runAwsLambdaImage(buffer, fileinfo){
  let myconfig = {
    "bucket": (fileinfo.bucket==='meshphoto-tmp')?'meshphoto':'meshphoto-dev',
    "reduce": {
      "class": "original",
      "directory": fileinfo.path,
      "quality": 90,
      "acl": "public-read"
    },
    "resizes": [
      {
        "class": "small",
        "size": 160,
        "directory": fileinfo.path,
        "suffix": "_small"
      },
      {
        "class": "medium",
        "size": 320,
        "directory": fileinfo.path,
        "suffix": "_medium"
      },
      {
        "class": "large",
        "size": 640,
        "directory": fileinfo.path,
        "suffix": "_large"
      },
      {
        "class": "huge",
        "size": 1024,
        "directory": fileinfo.path,
        "suffix": "_huge"
      }
    ]
  }

  try {
    let imageInfo = await getImageInfo(buffer);

    let imageData = new ImageData(
      fileinfo.path+fileinfo.name,
      fileinfo.bucket,
      buffer,
      { ContentType: imageInfo.mimetype },
      "public-read"
    );

    const fileSystem = new S3FileSystem('us-east-1');
    const processor  = new ImageProcessor(fileSystem, {});
    const config     = new Config(myconfig);
    
    let processedImages = await processor.processImage(imageData, config);
    const message = "OK, " + processedImages.length + " images were processed.";
    console.log(message);

    imageInfo.thumbnails = {};
    for(let i in processedImages){
      let destItem = processedImages[i];
      imageInfo.thumbnails[destItem.options.class] = destItem.fileName;
    }
    
    console.log(imageInfo);
    return imageInfo;
  }
  catch(messages) {
    if ( messages === "Object was already processed." ) {
      console.log("Image already processed");
      return "Image already processed";
    } else if ( messages === "Empty file or directory." ) {
      console.log( "Image file is broken or it's a folder" );
      return "Image file is broken or it's a folder";
    } else {
      throw "Error processing  + s3Object.object.key + : " + messages;
    }
  };

}
/*
function getFileName(imageInfo, baseName, type){
  let suffix = "";
  let ext = "";

  switch(type){
    case 'small':
      suffix = 't';
      break;
    case 'medium':
      suffix = 'm';
      break;
    case 'large':
      suffix = 'l';
      break;
    case 'huge':
      suffix = 'h';
      break;
  }

  switch(imageInfo.format.toUpperCase()){
    case 'JPEG':
      ext = '.jpg';
      break;
    case 'PNG':
      ext = '.png';
      break;
  }
  return baseName+suffix+ext;
}
*/

function getImageInfo(binaryData){
   
    return new Promise((resolve, reject) => {
        im(binaryData).identify((err, data) => {
            if(err){
                reject(err);
                return;
            }
            //console.log("image info from imagemagick:");
            //console.log(data);
            data.mimetype = mime.contentType(data.format);
            resolve(data);
        });
    });

}
/*
function resize(binaryData, width){
  return new Promise((resolve, reject) => {
    im(binaryData).resize(width)
    .noProfile().toBuffer((err, buffer) => {
      if(err){
          console.log(err);
          reject(err);
          return;
      }
      console.log("buffer");
      console.log(buffer.length);

      resolve(buffer);
    });
  });
}*/


exports.processImage = processImage;
