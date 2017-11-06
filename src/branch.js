let db = require('./dynamodb.js');
let _ = require('lodash');
let utils = require('./utils');
let Image = require('./image.js');
let dynamolock = require('./dynamolock');
let env = require('./env.js').env;

const TABLE_NAME = "Branches";

class Branch {
    constructor(reqData){
        this.reqData = reqData;
        this.branch_id = reqData.parent_fullid;
        this.tmpdb_id = reqData.parent_fullid+reqData.resourceid;
    }
	
    async addPicture() {
        try {
          let uploadData = await db.queryById(env.PHOTO_TMP_TABLE_NAME, this.tmpdb_id);
          console.log(uploadData);
          let tmpid = uploadData.id;

          //process image
          let imageInfo = await Image.processImage(this.reqData);
                    
          //db lock
          await dynamolock.getLock();
          let branchData = await db.queryById(TABLE_NAME, this.branch_id);
          console.log(branchData);

          //menu
          if(typeof branchData.photos == 'undefined'){
              branchData.photos = {};
          }

          //insert into db
          uploadData.url = {};
          for(let type in imageInfo.thumbnails){
            uploadData.url[type] = env.baseUrl+imageInfo.thumbnails[type];
          }
          uploadData.mimetype = imageInfo.mimetype;
          uploadData.size = imageInfo.size;
          delete uploadData.ttl;
          delete uploadData.id;


          let photo_id = this.reqData.resourceid;
          branchData.photos[photo_id] = uploadData;
          console.log("new data array=");
          console.log(branchData);

          let msg2 = await db.put(TABLE_NAME, branchData);

          //clear
          let clearData = {
              "id": tmpid
          }
          let delMsg = await db.delete(env.PHOTO_TMP_TABLE_NAME, clearData);
          
          return msg2;
        }catch(err) {
            console.log(err);
            throw err;
        }
    }
}

export default Branch;
