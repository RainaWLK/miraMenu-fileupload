//tmp
var dynamoLock = require('dynamo-lock'),
options = {
    awsConfig:{
//        "accessKeyId": "akid",
//        "secretAccessKey": "secret",
        "region": "us-east-1"
    }
};
const lockTableName = 'Lock';


function createLockTable(){
  let lockClient = dynamoLock.createClient(lockTableName, options);
  
  lockClient.createLockTable(function (err) {
      if (err) {
          console.log('Could not create lock table because ' + err);
      } else {
          console.log('Created lock table');
      }
  });
}

let counter = 0;

function getLock() {
  let lockTimeoutInMillis = 500;
  let lockClient = dynamoLock.createClient(lockTableName, options);

  return new Promise((resolve, reject) => {
    lockClient.getLock('testLock', lockTimeoutInMillis, function (err) {
      if (err) {
          console.log('Could not get lock');
          if(counter < 30){
            setTimeout(function(){
              getLock().then(() => {
                resolve();
              }).catch(() => {
                reject();
              });
            }, 300);
            counter++;
          }
          else {
            reject();
          }
      } else {
          console.log('Got lock!');
          resolve();
      }
    });   
  });
}

exports.getLock = getLock;

