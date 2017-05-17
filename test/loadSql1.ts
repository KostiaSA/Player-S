import * as fs from "fs";
import {importFrom1c} from "../1c/importFrom1c";
import {executeSql} from "../sql/MsSqlDb";

async function loadSql1() {

    let text = fs.readFileSync("C:/--EdemPlayer--/S/data1.sql", "utf8");
    let lines = text.split("\n");
    let c = 0;
    for (let line of lines) {
        try {
            if (c > 83212)
                await executeSql(line);
            console.log(c++);
        }
        catch (e) {
            console.log(line);
            console.log(e);
            break;
        }
    }
}


loadSql1();