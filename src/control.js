let db = require('./dynamodb.js');

const TABLE_NAME = "Control";

class Control {
    constructor(){
        //this.reqData = reqData;
    }

    getNewRestaurantID(table) {
        return new Promise((resolve, reject) => {
            db.queryById(TABLE_NAME, table+"MaxID").then(msg => {
                console.log("==getNewRestaurantID==");
                console.log(msg);
                let id = msg.value;

                //temp
                //let base = "2017";
                let next = parseInt(id, 10) + 1;
                /*switch(next.length){
                    case 1:
                        id = base + "000" + next;
                        break;
                    case 2:
                        id = base + "00" + next;
                        break;
                    case 3:
                        id = base + "0" + next;
                        break;
                    default:
                        id = base + next;
                        break;
                }*/
                let new_id = next.toString(10);

                resolve(new_id);
            }).catch(err => {
                reject(err);
            });
        });
    }

    updateMaxID(table, id) {
        let data = {};
        data[table+"MaxID"] = id;
        console.log(data);

        return new Promise((resolve, reject) => {
            db.put(TABLE_NAME, data).then(msg => {
                console.log("==updateMaxID==");
                console.log(msg);
                resolve(msg);
            }).catch(err => {
                reject(err);
            });
        });
    }
}

export default new Control;