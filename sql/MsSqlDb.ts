import * as sql from "mssql"
import {config} from "../config/config";

export async function getValueFromSql(sqlBatch: string, columnName: string): Promise<any> {
    return executeSql(sqlBatch).then((rows)=> {
        return rows[0][0][columnName];
    });
}

export async function executeSql(sqlBatch: string): Promise<any> {
    let options = {instanceName: config.sqlServerInstance} as any;

    let conf: sql.config = {
      //  driver: "msnodesqlv8",
        pool: {
            min: 0,
            max: 150,
            idleTimeoutMillis: 60000 /// не работает
        },
        server: config.sqlServerAddress,
        port: config.sqlServerPort,
        user: config.sqlLogin,
        database: config.sqlDatabase,
        password: config.sqlPassword,
        options: options,
        connectionTimeout:50000,
        requestTimeout:0
    }

    let connection = new sql.Connection(conf);

    return connection
        .connect()
        .then(()=> {
            let req = new sql.Request(connection);
            req.multiple = true;
            //console.log("sql",sqlBatch);
            return req.batch(sqlBatch);
        })
        .then((rowsSet: any)=> {
            //console.dir(rowsSet);
            return rowsSet;
        });

}
