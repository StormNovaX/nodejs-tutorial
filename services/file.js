const { Client } = require('pg');
module.exports = class FileService {
    constructor(){
        const client = new Client();
        client.connect()
            .then(()=>{
                console.log('Connection is ok ');
            })
            .catch(err =>{
                console.log('error occurs during PG connection',err)
            });
    }
    getConnectedClient(){
        const client = new Client();
        return client.connect()
            .then(()=> client)
            .catch(err => {
                console.log('error occur during pg connection ',err);
                throw err;
            });
    }
    saveFileInfos(fileInfo){
        let client;
        return this.getConnectedClient()
            .then(connectedClient => {
                client = connectedClient;
                client.query(
                    `INSERT INTO filestore("file-name","mime-type","original-name",size,encoding) 
                    VALUES ($1,$2,$3,$4,$5)`,
                    [
                        fileInfo.filename,
                        fileInfo.mimetype,
                        fileInfo.originalname,
                        fileInfo.size,
                        fileInfo.encoding
                    ]
                )
                    .then(result =>{
                        console.log(result);
                        client.end();
                        return result;
                    })
            });
    }
};
