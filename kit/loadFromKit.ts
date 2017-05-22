import {stringAsSql} from "../sql/SqlCore";
import {executeSql} from "../sql/MsSqlDb";
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("C:/--EdemPlayer--/S/static/KIT/epg.db");


export async function loadChannels(): Promise<void> {

    return new Promise<void>(
        (resolve: () => void, reject: (error: string) => void) => {

            let sql: string[] = [];

            db.each("SELECT * FROM channel", function (err: any, row: any) {

                sql.push(`IF NOT EXISTS(SELECT 1 FROM channel WHERE id=${row.id}) INSERT channel (id) VALUES(${row.id});`);
                sql.push(`
UPDATE channel SET
  idx=${row.idx}, 
  name=${stringAsSql(row.name)}, 
  number=${stringAsSql(row.number)}, 
  provider=${stringAsSql(row.provider)}, 
  icon=${stringAsSql(row.icon)}, 
  correct=${row.correct}, 
  id_list=${row.id_list}, 
  id_region=${row.id_region} 
WHERE id=${row.id}
`);

                //console.log(row);

            }, () => {

                //console.log(sql.join("\n"));
                executeSql(sql.join("\n")).then(()=>{
                    console.log("Загрузка Channels Ok");
                    resolve();
                });
            });

        });



}


export async function loadFromKit(): Promise<void> {
    await loadChannels();
}


loadFromKit()
    .then(() => {
        console.log("Загрузка KIT Ok");
        process.exit(0);
    })
    .catch((e) => {
        console.error("Загрузка KIT", e.toString())
        process.exit(1);
    });
