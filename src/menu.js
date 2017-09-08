let db = require('./dynamodb.js');
let _ = require('lodash');
let utils = require('./utils');
//let S3 = require('./s3');
//import { makeInfo } from './image.js';
let dynamolock = require('./dynamolock');

const PHOTO_TMP_TABLE_NAME = "photo_tmp";
const MENUS_TABLE_NAME = "Menus";


class Menu {
    constructor(reqData){
        this.reqData = reqData;
        //this.s3 = new S3(reqData.region, reqData.bucket);
        this.idArray = utils.parseID(reqData.parent_fullid);
        console.log(this.idArray);

        this.branchid = `r${this.idArray.r}`;
        if(typeof this.idArray.s != 'undefined'){
            this.branchid += `s${this.idArray.s}`;
        }
        //this.menu_fullID = this.branchid + `m${this.idArray.m}`;
        this.menu_fullID = reqData.parent_fullid;
        this.tmpdb_id = reqData.parent_fullid+reqData.resourceid;
    }
	
    async addPicture() {
        try {
            let uploadData = await db.queryById(PHOTO_TMP_TABLE_NAME, this.tmpdb_id);
            console.log(uploadData);
            let tmpid = uploadData.id;

            //db lock
            await dynamolock.getLock();
            let menusData = await db.queryById(MENUS_TABLE_NAME, this.branchid);
            console.log(menusData);

            //menu
            //let menuID = `m${this.idArray.m}`;
            let menuData = menusData.menus[this.menu_fullID];
            if(typeof menuData.photos == 'undefined'){
                menuData.photos = {};
            }
            console.log(menuData);

            //insert into db
            uploadData.url = {
                'origin': `https://${this.reqData.bucket}.s3.amazonaws.com/`+this.reqData.path
            }
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

export default Menu;
