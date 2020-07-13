# miraMenu-fileupload
Process image after uploaded and save to S3

file upload --> s3-tmp --> Lambda (this) --> s3  

Resize image to different size of thumbnail. Optimize data transfer to frontend.


### Init
```
npm install
```

### Local Simulation
```
npm start
```

test
```
npm test
```

### Deploy to AWS (first time)
```
npm run create
```

### Deploy
deploy to dev
```
npm run deploy
```

release to production
```
npm run release
```

### Destroy
```
npm run destroy
```


