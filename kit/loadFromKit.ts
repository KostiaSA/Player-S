import {dateTimeAsSql, stringAsSql} from "../sql/SqlCore";
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
                executeSql(sql.join("\n")).then(() => {
                    console.log("Загрузка Channels Ok");
                    resolve();
                });
            });

        });


}

export async function loadData(): Promise<void> {

    return new Promise<void>(
        (resolve: () => void, reject: (error: string) => void) => {


            let sql: string[] = [];
            let row_counter = 0;
            let counter = 0;

            db.each("SELECT * FROM data", function (err: any, row: any) {

                if (err) {
                    reject(err);
                    return;
                }

                sql.push(`IF NOT EXISTS(SELECT 1 FROM data WHERE id_channel=${row.id_channel} AND time=${stringAsSql(row.time)}) INSERT data (id_channel,time) VALUES(${row.id_channel},${stringAsSql(row.time)});`);
                sql.push(`
UPDATE data SET
  summer_time=${row.summer_time}, 
  title=${stringAsSql(row.title)},
  series=${stringAsSql(row.series)},
  id_category=${row.id_category}, 
  image=${stringAsSql(row.image)},
  [desc]=${stringAsSql(row.desc)},
  ids_genre=${stringAsSql(row.ids_genre)},
  ids_director=${stringAsSql(row.ids_director)},
  ids_actor=${stringAsSql(row.ids_actor)},
  year=${row.year}, 
  rating=${row.rating}, 
  is_new=${row.is_new} 
WHERE id_channel=${row.id_channel} AND time=${stringAsSql(row.time)}
`);
                if (row_counter++ % 1000 === 0)
                    console.log(row_counter);
                // if (sql.length > 2000) {
                //     console.log("star executeSql");
                //     executeSql(sql.join("\n")).then(() => {
                //         counter += 2000;
                //         console.log("executeSql " + counter);
                //     });
                //     sql.length = 0;
                // }


            }, () => {

                //console.log(sql.join("\n"));
                executeAll(sql).then(() => {
                    console.log("Загрузка data Ok");
                    resolve();
                });
            });

        });


}

export async function executeAll(sql: string[]) {
    let counter = 0;
    let sss = "";
    for (let s of sql) {
        sss += s + "\n";
        counter++;

        if (counter % 100 === 0) {
            await executeSql(sss);
            console.log("sql exec " + counter + " of " + sql.length);
            sss = "";
        }
    }
}


export async function loadPersons(): Promise<void> {

    return new Promise<void>(
        (resolve: () => void, reject: (error: string) => void) => {

            let sql: string[] = [];

            db.each("SELECT * FROM person", function (err: any, row: any) {

                sql.push(`IF NOT EXISTS(SELECT 1 FROM person WHERE id=${row.id}) INSERT person (id) VALUES(${row.id});`);
                sql.push(`
UPDATE person SET
  value=${stringAsSql(row.value)} 
WHERE id=${row.id}
`);
                //console.log(row);

            }, () => {

                //console.log(sql.join("\n"));
                executeSql(sql.join("\n")).then(() => {
                    console.log("Загрузка Persons Ok");
                    resolve();
                });
            });

        });

}

export async function loadGenres(): Promise<void> {

    return new Promise<void>(
        (resolve: () => void, reject: (error: string) => void) => {

            let sql: string[] = [];

            db.each("SELECT * FROM Genre", function (err: any, row: any) {

                sql.push(`IF NOT EXISTS(SELECT 1 FROM Genre WHERE id=${row.id}) INSERT Genre (id) VALUES(${row.id});`);
                sql.push(`
UPDATE Genre SET
  value=${stringAsSql(row.value)} 
WHERE id=${row.id}
`);
                //console.log(row);

            }, () => {

                //console.log(sql.join("\n"));
                executeSql(sql.join("\n")).then(() => {
                    console.log("Загрузка Genres Ok");
                    resolve();
                });
            });

        });

}

export async function loadLists(): Promise<void> {

    return new Promise<void>(
        (resolve: () => void, reject: (error: string) => void) => {

            let sql: string[] = [];

            db.each("SELECT * FROM List", function (err: any, row: any) {

                sql.push(`IF NOT EXISTS(SELECT 1 FROM List WHERE id=${row.id}) INSERT List (id) VALUES(${row.id});`);
                sql.push(`
UPDATE List SET
  value=${stringAsSql(row.value)} 
WHERE id=${row.id}
`);
                //console.log(row);

            }, () => {

                //console.log(sql.join("\n"));
                executeSql(sql.join("\n")).then(() => {
                    console.log("Загрузка Lists Ok");
                    resolve();
                });
            });

        });

}

export async function loadFromKit(): Promise<void> {
    await loadChannels();
    await loadPersons();
    await loadGenres();
    await loadLists();
    await loadData();
    await executeSql("EXEC [fill_endtime]");
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
