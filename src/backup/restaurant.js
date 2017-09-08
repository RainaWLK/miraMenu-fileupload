let db = require('./dynamodb.js');
//let JSONAPI = require('./jsonapi.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
import S3 from './s3';
import { makeInfo } from './image.js';

const TABLE_NAME = "Restaurants";
const CONTROL_TABLE_NAME = "Control";
const S3BUCKET = "jumi-upload";

const S3_URL = "https://s3.amazonaws.com/"+S3BUCKET+"/";

function RestaurantControl() {
    //contructor() {
        this.branchesMaxID = "0";
        this.branch_ids = [];
        this.photoMaxID = "0";
    //}
}

class Restaurant {
    constructor(reqData){
        this.reqData = reqData;

        this.s3 = new S3("us-east-1", S3BUCKET);
    }

    getNewPictureID(controlData){
        //migration
        if(typeof controlData.photoMaxID == 'undefined'){
            controlData.photoMaxID = "0";
        }
		
        let maxID = parseInt(controlData.photoMaxID, 10) + 1;
        return maxID.toString();
    }
	
    /*async getPicture() {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let path = "restaurants/"+restaurant_id+"/pictures";
	        let file_name = this.reqData.params.picture_id + ".jpg";
			console.log(file_name);
            let data = await this.s3.getS3Obj(path + "/" + file_name);
            return data;
        }catch(err) {
            throw err;
        }
    }

	async getPictureInfo() {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let picture_id = this.reqData.params.picture_id;

            return restaurantData.photos[picture_id];
        }catch(err) {
            throw err;
        }
    }*/
	
    async addPicture(payload, binaryData) {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);
	        let path = "restaurants/"+restaurant_id+"/photo";
			
            let photo_id = this.getNewPictureID(restaurantData.restaurantControl);
	        let file_name = photo_id+".jpg";

            
            let msg = await this.s3.uploadToS3(path + "/" + file_name, binaryData);
		
            //update db
            if(typeof restaurantData.photo == 'undefined'){
                restaurantData.photo = []; //filename: desc
            }
            payload.url = S3_URL + file_name;
            restaurantData.photo.push(payload);
            restaurantData.restaurantControl.photoMaxID = photo_id;
        
            let msg2 = await db.put(TABLE_NAME, restaurantData);
            //console.log(msg);
            return msg;
        }catch(err) {
            console.log(err);
            throw err;
        }
    }
}


export default Restaurant;