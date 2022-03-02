# sales-champ-MongoDB WebServices
Node.js application that exposes its API through REST service using Mongo Db as the backend database


## Project on github
https://github.com/samuelaj1/salesChamp-MongoDb

## Project documentation on postman
```
https://documenter.getpostman.com/view/8854544/UVksNF2y
```
## Local Project setup
```
locate the project directory
cd /salesChampWebServices
```

```
install node modules 
"npm i"
```

```
Serving the application
"node server.js" or "nodemon"
#NB: url for local server: http://localhost:8081
```
 
## Live Project hosted on heroku
```
Project was hosted on heroku
Base url: https://sales-champ-mongo-db.herokuapp.com/
```
```
eg: Addresses endpoints

GET https://https://sales-champ-mongo-db.herokuapp.com/address - Returns all available addresses
POST https://https://sales-champ-mongo-db.herokuapp.com/address - Creates new address
GET https://https://sales-champ-mongo-db.herokuapp.com/address/{id} - Returns specific address
PATCH https://https://sales-champ-mongo-db.herokuapp.com/address/{id} - Modifies specific address
DELETE https://https://sales-champ-mongo-db.herokuapp.com/address/{id} - Permanently removes specific address

```



