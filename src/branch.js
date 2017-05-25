let db = require('./dynamodb.js');
//let JSONAPI = require('./jsonapi.js');
import Control from './control.js';
import { cloneDeep } from 'lodash';
import S3 from './s3';
import { makeInfo } from './image.js';

const TABLE_NAME = "Branches";
const RESTAURANT_TABLE_NAME = "Restaurants";
const S3BUCKET = "jumi-upload";

function BranchControl() {
    //contructor() {
        //this.branchesMaxID = "0";
        //this.branch_ids = [];
        this.restaurant_id = "0";
        this.branch_id = "0";
        this.tablesMaxID = "t001";
        this.menusMaxID = "m001";
        this.itemsMaxID = "i001";
        //this.table_ids = [];
    //}
}

class Branches {
    constructor(reqData){
        this.reqData = reqData;
    }

    getNewID(restaurantData) {
        console.log('==getNewID==');
        console.log(restaurantData);
        let maxID = parseInt(restaurantData.restaurantControl.branchesMaxID, 16) + 1;
        console.log(maxID);
        return maxID.toString();
    }

    getNewPictureID(controlData){
        //migration
        if(typeof controlData.pictureMaxID == 'undefined'){
            controlData.pictureMaxID = "0";
        }
		
        let maxID = parseInt(controlData.pictureMaxID, 10) + 1;
        return maxID.toString();
    }

    async getByID() {
        try {
            let id = this.reqData.params.restaurant_id+this.reqData.params.branch_id;
            let data = await db.queryById(TABLE_NAME, id);
            delete data.branchControl;
            //table
            let tableArray = [];
            for(let table_id in data.tables){
                tableArray.push(table_id);
            }
            data.tables = tableArray;

            let output = JSONAPI.makeJSONAPI(this.reqData.paths[3], data);
            return output;
        }catch(err) {
            throw err;
        }
    }

    async addPicture(payload, binaryData) {
        try {
            let restaurant_id = this.reqData.params.restaurant_id;
            let branch_id = this.reqData.params.branch_id;
            let id = restaurant_id+branch_id;
            let branchData = await db.queryById(TABLE_NAME, id);

	        let path = "restaurants/"+restaurant_id+"/branches/"+branch_id+"/pictures";
			
            let picture_id = this.getNewPictureID(branchData.branchControl);
	        let file_name = picture_id+".jpg";

            
            let msg = await this.s3.uploadToS3(path + "/" + file_name, binaryData);
		
            //update db
            if(typeof branchData.photos == 'undefined'){
                branchData.photos = {}; //filename: desc
            }
            branchData.photos[picture_id] = payload;
            branchData.branchControl.pictureMaxID = picture_id;
        
            let msg2 = await db.put(TABLE_NAME, branchData);
            //console.log(msg);
            return msg;
        }catch(err) {
            console.log(err);
            throw err;
        }
    }
}


export default Branches;