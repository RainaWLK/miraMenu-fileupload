let AWS = require('aws-sdk');
AWS.config.update({
    region: "us-east-1"
});
//if (typeof Promise === 'undefined') {
//  AWS.config.setPromisesDependency(require('bluebird'));
//}
//AWS.config.setPromisesDependency(require('Q').Promise);
//const doc = require('dynamodb-doc');
const docClient = new AWS.DynamoDB.DocumentClient();

function makeResponse(err, msg) {
    /*let res = {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(msg),
        headers: {
            'Content-Type': 'application/json'
        }
    }*/
    let res = err ? err.message : msg;


    return res;
}

async function queryDataById(tableName, id){
    var params = {
        TableName : tableName,
        KeyConditionExpression: "#id = :id",
        ExpressionAttributeNames:{
            "#id": "id"
        },
        ExpressionAttributeValues: {
            ":id":id
        }
    };

    let dataArray = await queryData(params);
    if(dataArray.length == 0) {
        throw new Error();
    }
    //debug
    if(dataArray.length > 1){
        console.log('!!!! queryDataById issue !!!!!');
    }
    return dataArray[0];
}

function queryDataByName(tableName, name){
    var params = {
        TableName : tableName,
        KeyConditionExpression: "#n = :n",
        ExpressionAttributeNames:{
            "#n": "name"
        },
        ExpressionAttributeValues: {
            ":n":name
        }
    };

    return queryData(params);
}

function queryData(params) {
    console.log("==queryData==");
    console.log(params);
    return new Promise((resolve, reject) => {
        docClient.query(params).promise().then(data => {
            resolve(data.Items);
        }).catch(err => { 
            reject(err);
        });
    });
}

async function scanDataByFilter(params){
    try {
        let data = await docClient.scan(params).promise();
        return data.Items;
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

async function scanData(tableName){
    try {
        let data = await docClient.scan({ TableName: tableName }).promise();
        return data.Items;
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

function postData(tableName, data){
    var params = {
        TableName: tableName,
        Item: data
    };
    console.log("==postData==");
    console.log(params.Item);
    return new Promise((resolve, reject) => {

        docClient.put(params).promise().then(result => {
            console.log("Added item:", JSON.stringify(result, null, 2));
            resolve(result);
        }).catch(err => {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            reject(err);
        });

    });
    
}

function putData(tableName, data){

    let updateAttr = {};
    let updateExp = "set ";
    let replacedName = {};
    let num = 0;
    for(let i in data){
        if(i == 'id')
            continue;
        updateExp += "#b" + num + "=" + ":a" + num +",";
        replacedName["#b"+num] = i;
        updateAttr[":a"+num] = data[i];
        num++;
    }
    updateExp = updateExp.slice(0, updateExp.length-1); //remove last char

    var params = {
        TableName: tableName,
        Key:{
            "id": data.id
        },
        UpdateExpression: updateExp,
        ExpressionAttributeNames: replacedName,
        ExpressionAttributeValues: updateAttr,
        ReturnValues:"UPDATED_NEW"
    };

    return new Promise((resolve, reject) => {

        docClient.update(params).promise().then(result => {
            console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
            resolve(result);
        }).catch(err => {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            reject(err);
        });

    });
    
}

function deleteData(tableName, data){
    var params = {
        TableName:tableName,
        Key:{
            "id": data.id
        }
        //ConditionExpression:"info.rating <= :val",
        //ExpressionAttributeValues: {
        //    ":val": 5.0
        //}
    };

    return new Promise((resolve, reject) => {
        docClient.delete(params).promise().then(result => {
            console.log("DeleteItem succeeded:", JSON.stringify(result, null, 2));
            resolve(result);
        }).catch(err => {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            reject(err);
        });

    });
    
}

exports.queryById = queryDataById;
exports.queryDataByName = queryDataByName;
exports.scan = scanData;
exports.post = postData;
exports.put = putData;
exports.delete = deleteData;

exports.scanDataByFilter = scanDataByFilter;