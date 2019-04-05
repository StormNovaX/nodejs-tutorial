const fs = require('fs');
const { Pool } = require('pg');
const util = require('util');

const unlink = util.promisify(fs.unlink);
module.exports = class FileService {
    constructor() {
        this.pool = new Pool();
    }

    /*getConnectedClient() {
        const client = new Client();
        return client.connect()
            .then(() => client)
            .catch(err => {
                console.log('error occur during pg connection ', err);
                throw err;
            });
    }*/

    saveFileInfos(fileInfo) {
        let client;
        return this.pool.connect()
            .then(connectedClient => {
                client = connectedClient;
                return client.query('BEGIN');
            })
            .then(() => {
                return client.query(
                    `INSERT INTO filestore("file-name","mime-type","original-name",size,encoding) 
            VALUES ($1,$2,$3,$4,$5)`,
                    [
                        fileInfo.filename,
                        fileInfo.mimetype,
                        fileInfo.originalname,
                        fileInfo.size,
                        fileInfo.encoding
                    ]
                );
            })
            .then(() => {
                return client.query('COMMIT');
            })
            .then(() => {
                client.end();
            })
            .catch(err => {
                console.log('error occurs', err);
                return client.query('ROLLBACK')
                    .then(() => {
                        client.end();
                        return unlink('data/upload/' + fileInfo.filename);
                    })
                    .then(() => Promise.reject(err));
            });
        }
        getFileInfo(){
            let client;
            return this.pool.connect()
                .then(connectedClient =>{
                    client = connectedClient;
                    return client.query(
                        `SELECT id,"file-name","mime-type","original-name",size,encoding FROM filestore `
                    );
                })
                .then(result => result.rows);
        }

        getFile(id){
            let client;
            console.log(id);
            return this.pool.connect()
                .then(connectedClient =>{
                    client = connectedClient;
                    return client.query(
                        `SELECT "file-name","mime-type","original-name",size,encoding FROM filestore WHERE id = $1`,
                        [id]
                    );
                })
                .then(result => {
                    client.release();
                    if(result.rows.length === 0) return Promise.reject('no result');
                    const fileInfo = result.rows[0];
                    const fileReadStream = fs.createReadStream(__dirname+'/../data/upload/'+ fileInfo['file-name']);
                    return { fileReadStream, fileInfo};
                });
        }
};
