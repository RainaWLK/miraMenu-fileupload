let db = require('./dynamodb.js');
let _ = require('lodash');
let utils = require('./utils');
let Image = require('./image.js');
let dynamolock = require('./dynamolock');
let env = require('./env.js').env;

const MENUS_TABLE_NAME = "Menus";

class Menu {
    constructor(reqData){
      this.reqData = reqData;
      this.idArray = utils.parseID(reqData.parent_fullid);
      console.log(this.idArray);

      this.branchid = `r${this.idArray.r}`;
      if(typeof this.idArray.s != 'undefined'){
          this.branchid += `s${this.idArray.s}`;
      }
      this.menu_fullID = reqData.parent_fullid;
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
        let menusData = await db.queryById(MENUS_TABLE_NAME, this.branchid);
        console.log(menusData);

        //menu
        let menuData = menusData.menus[this.menu_fullID];
        if(typeof menuData.photos == 'undefined'){
            menuData.photos = {};
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
        menuData.photos[photo_id] = uploadData;
        console.log("new data array=");
        console.log(menusData);

        let msg2 = await db.put(MENUS_TABLE_NAME, menusData);

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

export default Menu;
