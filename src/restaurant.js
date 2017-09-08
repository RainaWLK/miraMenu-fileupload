let db = require('./dynamodb.js');
let _ = require('lodash');
let utils = require('./utils');
//let S3 = require('./s3');
//import { makeInfo } from './image.js';
let dynamolock = require('./dynamolock');

const PHOTO_TMP_TABLE_NAME = "photo_tmp";
const TABLE_NAME = "Restaurants";


class Restaurant {
    constructor(reqData){
        this.reqData = reqData;
        //this.s3 = new S3(reqData.region, reqData.bucket);
        //this.idArray = utils.parseID(reqData.parent_fullid);
        //console.log(this.idArray);

        //this.restaurant_id = `r${this.idArray.r}`;

        this.restaurant_id = reqData.parent_fullid;
        this.tmpdb_id = reqData.parent_fullid+reqData.resourceid;
    }
	
    async addPicture() {
        try {
            let uploadData = await db.queryById(PHOTO_TMP_TABLE_NAME, this.tmpdb_id);
            console.log(uploadData);
            let tmpid = uploadData.id;

            let restaurantData = await db.queryById(TABLE_NAME, this.restaurant_id);
            console.log(restaurantData);

            //menu
            if(typeof restaurantData.photos == 'undefined'){
                restaurantData.photos = {};
            }
            console.log(restaurantData);

            //insert into db
            uploadData.url = {
                'origin': `https://${this.reqData.bucket}.s3.amazonaws.com/`+this.reqData.path
            }
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
            console.log(clearData);
            let delMsg = await db.delete(PHOTO_TMP_TABLE_NAME, clearData);
            console.log(delMsg);
            
            return msg2;
        }catch(err) {
            console.log(err);
            throw err;
        }
    }
}

export default Restaurant;
