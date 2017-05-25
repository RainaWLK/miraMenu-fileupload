let db = require('./dynamodb.js');
//let JSONAPI = require('./jsonapi.js');
import { cloneDeep } from 'lodash';
import { sprintf } from 'sprintf-js';
import S3 from './s3';
import { makeInfo } from './image.js';

const TABLE_NAME = "Restaurants";
const CONTROL_TABLE_NAME = "Control";

function RestaurantControl() {
    //contructor() {
        this.branchesMaxID = "0";
        this.branch_ids = [];
        this.pictureMaxID = "0";
    //}
}

class Restaurant {
    constructor(reqData){
        this.reqData = reqData;
    }

    getNewPictureID(controlData){
	//migration
	if(typeof controlData.pictureMaxID == 'undefined'){
		controlData.pictureMaxID = "0";
	}
		
        let maxID = parseInt(controlData.pictureMaxID, 10) + 1;
        return maxID.toString();
    }
	
    async getPicture() {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let path = "restaurants/"+restaurant_id+"/pictures";
	        let file_name = this.reqData.params.picture_id + ".jpg";
			console.log(file_name);
            let data = await S3.getS3Obj(path + "/" + file_name);
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
    }
	
    async addPicture(payload, binaryData) {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);
	        let path = "restaurants/"+restaurant_id+"/pictures";
			
            let picture_id = this.getNewPictureID(restaurantData.restaurantControl);
	        let file_name = picture_id+".jpg";

            let msg = await S3.uploadToS3(path + "/" + file_name, binaryData);
		
            //update db
            if(typeof restaurantData.photos == 'undefined'){
                restaurantData.photos = {}; //filename: desc
            }
            restaurantData.photos[picture_id] = payload;
            restaurantData.restaurantControl.pictureMaxID = picture_id;
        
            let msg2 = await db.put(TABLE_NAME, restaurantData);
            //console.log(msg);
            return msg;
        }catch(err) {
            console.log(err);
            throw err;
        }
    }

    async deletePicture() {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let restaurantData = await db.queryById(TABLE_NAME, restaurant_id);

	        let path = "restaurants/"+restaurant_id+"/pictures";

		    let picture_id = this.reqData.params.picture_id;
            let file_name = picture_id + ".jpg";
            if(typeof restaurantData.photos[picture_id] == 'undefined'){
                console.log("not found");
                throw null;
            }

            let msg = await S3.deleteS3Obj(path + "/" + file_name);

             //update db
            delete restaurantData.photos[picture_id];
        
            console.log(restaurantData);
            let msg2 = await db.put(TABLE_NAME, restaurantData);           
            return msg;
        }catch(err) {
            throw err;
        }
    }
}


export default Restaurant;