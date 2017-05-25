var mime = require('mime-types');
import gm from 'gm';
const im = gm.subClass({ imageMagick: true });


function getImageInfo(userInfo, binaryData){
    let imageInfo = userInfo;

  //  try {
  //      let metadata = await sharp(binaryData).metadata();
  //      console.log(metadata);    
  //      let mimetype = mime.contentType(metadata.format);
  //      imageInfo.mimeType = mimetype;
        
  //      imageInfo.width = metadata.width;
  //      imageInfo.height = metadata.height;
  //      return imageInfo;
  //  }
  //  catch(err){
  //      throw(err);
  //  }



    
    return new Promise((resolve, reject) => {
        im(binaryData).identify((err, data) => {
            if(err){
                reject(err);
                return;
            }
            //console.log(data);
            let mimetype = mime.contentType(data.format);
            imageInfo.mimeType = mimetype;
            imageInfo.size = data.size; //width, height
            console.log(imageInfo);
            resolve(imageInfo);
        });
    });

}


exports.getImageInfo = getImageInfo;
