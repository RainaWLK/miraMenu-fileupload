function parseID(input){
  let result = {};
  let typeArray = input.match(/[^0-9a-fA-F]/g);
  let pattern = new RegExp(/[^rstmip]/);

  let tail = input.length;
  for(let i = 0; i < typeArray.length; i++){
    let type = typeArray[i];

    //check
    if(pattern.test(type)){
      continue;
    }

    let start = input.indexOf(type)+1;

    let end = tail;
    if(i < typeArray.length-1){
      end = input.indexOf(typeArray[i+1]);
    }

    let id = input.substring(start, end);

    result[type] = id;
  }
  return result;
}

function makeFullID(idArray){

  let id = "";
  if(typeof idArray.r != 'undefined'){
    id += `r${idArray.r}`;
  }
  if(typeof idArray.s != 'undefined'){
    id += `s${idArray.s}`;
  }
  if(typeof idArray.t != 'undefined'){
    id += `t${idArray.t}`;
  }
  if(typeof idArray.m != 'undefined'){
    id += `m${idArray.m}`;
  }  
  if(typeof idArray.i != 'undefined'){
    id += `i${idArray.i}`;
  }
  if(typeof idArray.p != 'undefined'){
    id += `p${idArray.p}`;
  }
  console.log(`makeFullID=${id}`);
  return id;
}

function makePath(idArray){

  let path = "";
  if(typeof idArray.r != 'undefined'){
    path += `/restaurants/r${idArray.r}`;
  }
  if(typeof idArray.s != 'undefined'){
    path += `/branches/s${idArray.s}`;
  }
  if(typeof idArray.t != 'undefined'){
    path += `/tables/t${idArray.t}`;
  }
  if(typeof idArray.m != 'undefined'){
    path += `/menus/m${idArray.m}`;
  }  
  if(typeof idArray.i != 'undefined'){
    path += `/items/i${idArray.i}`;
  }
  if(typeof idArray.p != 'undefined'){
    path += `/photos/p${idArray.p}`;
  }
  path = path.slice(1);
  return path;
}

exports.parseID = parseID;
exports.makePath = makePath;
exports.makeFullID = makeFullID;