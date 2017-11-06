let db = require('./dynamodb.js');
let _ = require('lodash');
let utils = require('./utils');
let Image = require('./image.js');
let dynamolock = require('./dynamolock');
let env = require('./env.js').env;

const TABLE_NAME = "Restaurants";

class Restaurant {
    constructor(reqData){
      this.reqData = reqData;

      this.restaurant_id = reqData.parent_fullid;
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
          let restaurantData = await db.queryById(TABLE_NAME, this.restaurant_id);
          console.log(restaurantData);

          //menu
          if(typeof restaurantData.photos == 'undefined'){
              restaurantData.photos = {};
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
          restaurantData.photos[photo_id] = uploadData;
          console.log("new data array=");
          console.log(restaurantData);

          let msg2 = await db.put(TABLE_NAME, restaurantData);

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

export default Restaurant;
