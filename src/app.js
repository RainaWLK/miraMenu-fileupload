let S3 = require('./s3');
//import { getImageInfo } from './image.js';
let db = require('./dynamodb');
let utils = require('./utils');
let _ = require('lodash');

import Restaurant from './restaurant.js';
import Branch from './branch.js';
import Menu from './menu.js';
import Item from './item.js';


async function route(req){
    let cmdObj;
    console.log(req);
    switch(req.category){
        case 'restaurants':
            cmdObj = new Restaurant(req);
            break;
        case 'branches':
            cmdObj = new Branch(req);
            break;
        //case 'tables':
        //    cmdObj = new Table(req);
        //    break;
        case 'menus':
            cmdObj = new Menu(req);
            break;
        case 'items':
            cmdObj = new Item(req); 
            break;
        default:
            throw null;
    }
    let result;
    switch(req.resourcetype){
        case 'photos':
            result = await cmdObj.addPicture();
            break;
        case 'resources':
            result = await cmdObj.addResource();
            break;
    }

    return result;
}

function parsePath(path){
    let pathArray = path.split('/');
    let filename = "";
    let parent_fullid = "";
    let category = "";
    let resourcetype = "";

    for(let i = 0; i < pathArray.length-2; i+=2){
        parent_fullid += pathArray[i+1];
    }
    filename = pathArray[pathArray.length-1];
    category = pathArray[pathArray.length-4];
    resourcetype = pathArray[pathArray.length-2];

    let p = filename.lastIndexOf('.');
    let resource_id = filename;
    if(p > 0){
        resource_id = filename.substring(0, p);
    }
    
    //fullid += id;
    
    return {
        "filename": filename,
        "parent_fullid": parent_fullid,
        "resourceid": resource_id,
        "category": category,
        "resourcetype": resourcetype
    };
}


async function onFileUploaded(event, context){
    let pathStr = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    let pathObj = parsePath(pathStr);
    console.log(pathObj);

    const fileinfo = {
        region: event.Records[0].awsRegion,
        bucket: event.Records[0].s3.bucket.name,
        category: pathObj.category,
        resourcetype: pathObj.resourcetype,
        resourceid: pathObj.resourceid,
        parent_fullid: pathObj.parent_fullid,
        name: pathObj.filename,
        size: event.Records[0].s3.object.size,
        etag: event.Records[0].s3.object.eTag,
        path: pathStr

        //sequencer: event.Records[0].s3.object.sequencer
    }
    //console.log(event.Records[0]);
    console.log(fileinfo);
    //let s3 = new S3(event.Records[0].awsRegion, fileinfo.bucket);

    try {
        let result = await route(fileinfo);
        console.log(result);
        return result;
    }
    catch(err){
        const message = `Error getting object ${fileinfo.name} from bucket ${fileinfo.bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        console.log(err);
        throw err;
    }
    

}

exports.onFileUploaded = onFileUploaded;
