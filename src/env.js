class Env {
  constructor(){
    this.PHOTO_TMP_TABLE_NAME = "photo_tmp";
    this.PRODUCTION_BUCKET = 'meshphoto';

    this.baseUrl = "";
  }

  init(fileinfo){
    if(fileinfo.bucket === (this.PRODUCTION_BUCKET+"-tmp")){
      this.baseUrl = 'https://cdn.mira.menu/';
    }
    else {
      let bucket = fileinfo.bucket.replace('-tmp', '');
      this.baseUrl = `https://${bucket}.s3.amazonaws.com/`;
    }
  }
}

let env = new Env();
exports.env = env;