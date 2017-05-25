import * as express from "express";
import crypto = require("crypto-js");
import {
    GET_ENCRYPT_KEY_CMD,
    LOGIN_CMD,
    IReq,
    IGetEncryptKeyReq,
    IGetEncryptKeyAns,
    IAns,
    ILoginReq,
    ILoginAns,
    BAD_LOGIN_PASSWORD,
    LOAD_RALLYHEADER_CMD,
    LOAD_RALLYSPECUCH_CMD,
    ILoadRallyHeaderReq,
    ILoadRallyHeaderAns,
    RallyHeader_replTable,
    IRallyHeader,
    ILoadRallySpecUchReq,
    ILoadRallySpecUchAns,
    RallySpecUch_replTable,
    IRallySpecUch,
    RallyPunkt_replTable,
    LOAD_RALLYPUNKT_CMD,
    ILoadRallyPunktReq,
    ILoadRallyPunktAns,
    IRallyPunkt,
    UsersLink_replTable,
    LegRegistration_replTable,
    ILoadLegRegistrationAns,
    ILoadLegRegistrationReq,
    ILegRegistration,
    LOAD_LEGREGISTRATION_CMD,
    // LOAD_PILOTS_CMD,
    // ILoadPilotsReq,
    // ILoadPilotsAns,
    // Pilots_replTable,
    // IPilot,
    LOAD_CHECKPOINTS_CMD,
    CheckPoint_replTable,
    ILoadCheckPointsReq,
    ILoadCheckPointsAns,
    ICheckPoint,
    ISaveCheckPointsAns,
    ISaveCheckPointsReq,
    SAVE_CHECKPOINTS_CMD, LOAD_CURRENT_EPG, IEpg, ILoadCurrentEpgReq, ILoadCurrentEpgAns, ILoadInfoReq, ILoadInfoAns,
    IInfo, LOAD_INFO, RELOAD_PLAYLIST, IReloadPlayListReq, IReloadPlayListAns, LOAD_ARCH_EPG, ILoadArchEpgAns,
    ILoadArchEpgReq, GET_PLAYLIST, SET_PLAYLIST, IGetPlayListReq, IGetPlayListAns, ISetPlayListAns, ISetPlayListReq
} from "./api/api";
import {getInstantPromise} from "./utils/getInstantPromise";
import {stringAsSql, dateTimeAsSql} from "./sql/SqlCore";
import {getValueFromSql, executeSql} from "./sql/MsSqlDb";
import {replaceAll} from "./utils/replaceAll";
import {loadUtf8FileFromUrl} from "./utils/loadUtf8FileFromUrl";
import {throws} from "assert";

function sqlDateToStr(date: Date): any {
    return replaceAll(date.toISOString().replace("Z", "").replace("T", " "), "-", "/").split(".")[0];
}

export function commonApiResponse(req: express.Request, res: express.Response, next: Function) {
    //console.log("api1", req.body);

    if (req.body.cmd === GET_ENCRYPT_KEY_CMD) {
        res.send(JSON.stringify({encryptKey: getEncryptKeyFromSessionId(req.body.sessionId)}));
        return;
    }

    let ans: Promise<any>;

    var bytes = crypto.AES.decrypt(req.body.body, getEncryptKeyFromSessionId(req.body.sessionId));
    let decryptedBody = JSON.parse(bytes.toString(crypto.enc.Utf8)) as any;
    //let decryptedBody = JSON.parse(req.body.body) as any;


    switch (req.body.cmd) {
        case LOGIN_CMD:
            ans = LOGIN_handler(decryptedBody);
            break;
        // case LOAD_RALLYHEADER_CMD:
        //     ans = LOAD_RALLYHEADER_handler(decryptedBody);
        //     break;
        // case LOAD_RALLYSPECUCH_CMD:
        //     ans = LOAD_RALLYSPECUCH_handler(decryptedBody);
        //     break;
        // case LOAD_RALLYPUNKT_CMD:
        //     ans = LOAD_RALLYPUNKT_handler(decryptedBody);
        //     break;
        // case LOAD_LEGREGISTRATION_CMD:
        //     ans = LOAD_LEGREGISTRATION_handler(decryptedBody);
        //     break;
        // case LOAD_CHECKPOINTS_CMD:
        //     ans = LOAD_CHECKPOINTS_handler(decryptedBody);
        //     break;
        // case SAVE_CHECKPOINTS_CMD:
        //     ans = SAVE_CHECKPOINTS_handler(decryptedBody);
        //     break;

        case LOAD_CURRENT_EPG:
            ans = LOAD_CURRENT_EPG_handler(decryptedBody);
            break;

        case LOAD_INFO:
            ans = LOAD_INFO_handler(decryptedBody);
            break;

        case RELOAD_PLAYLIST:
            ans = RELOAD_PLAYLIST_handler(decryptedBody);
            break;

        case LOAD_ARCH_EPG:
            ans = LOAD_ARCH_EPG_handler(decryptedBody);
            break;

        case GET_PLAYLIST:
            ans = GET_PLAYLIST_handler(decryptedBody);
            break;

        case SET_PLAYLIST:
            ans = SET_PLAYLIST_handler(decryptedBody);
            break;

        default:
            ans = getInstantPromise({error: "invalid player server api command"});
    }

    ans
        .then((ansObj: any) => {
            res.send(JSON.stringify(ansObj));
        })
        .catch((err: any) => {
            res.send(JSON.stringify({error: err.toString()}));
        });

}

function getEncryptKeyFromSessionId(sessionId: string): string {
    return crypto.MD5("x22dtt" + sessionId + "gdfdgsr55").toString().substr(2, 32);
}


async function LOGIN_handler(req: ILoginReq): Promise<ILoginAns> {

    //return getInstantPromise({user: "mibox"});

    let sql = `SELECT ISNULL((SELECT [Password] FROM [User] WHERE [Login]=${stringAsSql(req.login)}),'ujfgff74hdr4wio3645hfdt') Password`;
    // let sql2 = `SELECT ISNULL((SELECT FIO FROM _Users WHERE [Login]=${stringAsSql(req.login)}),'') FIO`;
    //
    let pass = await getValueFromSql(sql, "Password");
    // let fio = await getValueFromSql(sql2, "FIO");
    //
    if (req.password === pass)
        return getInstantPromise({user: req.login});
    else
        return getInstantPromise({error: BAD_LOGIN_PASSWORD, user: ""});

}

async function LOAD_RALLYHEADER_handler(req: ILoadRallyHeaderReq): Promise<ILoadRallyHeaderAns> {
    let replTable = RallyHeader_replTable;

    let sql = `select count(1) cnt from ReplLog where ReplTable=${replTable} and DBTS>${req.dbts || "0x00"}`;

    let count = await getValueFromSql(sql, "cnt");

    if (count === 0)
        return getInstantPromise({rallyHeader: undefined});
    else {

        sql = `
SELECT TOP 1
  [Ключ],[Номер],[Название],[Дата],[EngName],[Дата окончания],[Место проведения]
FROM 

[_RallyHeader] WHERE Ключ IN (SELECT _RallyHeader from [_RallySpecUch] where [Текущий этап]=1)
  
SELECT master.sys.fn_varbintohexstr(max(DBTS)) dbts FROM ReplLog where ReplTable=${replTable}  
`;

        let rows = await executeSql(sql);

        let row = rows[0][0];
        let dbts = rows[1][0]["dbts"];

        if (row) {
            let rallyHeader: IRallyHeader = {
                id: row["Ключ"],
                num: row["Номер"],
                name: row["Название"],
                begDate: row["Дата"],
                endDate: row["Дата окончания"],
                place: row["Место проведения"],
            };

            return getInstantPromise({rallyHeader: rallyHeader, dbts: dbts});
        }
        else {
            return getInstantPromise({rallyHeader: undefined, dbts: dbts});
        }

    }
}


async function LOAD_RALLYSPECUCH_handler(req: ILoadRallySpecUchReq): Promise<ILoadRallySpecUchAns> {
    let replTable = RallySpecUch_replTable;

    let sql = `select count(1) cnt from ReplLog where ReplTable=${replTable} and DBTS>${req.dbts || "0x00"}`;

    let count = await getValueFromSql(sql, "cnt");

    if (count === 0)
        return getInstantPromise({rallySpecUch: undefined});
    else {
        sql = `
SELECT 
  Ключ, Номер, Название, Дата, Длина, TimeZone, NPP, [Кол.кругов], StageDay, НазваниеАнгл, [Мин.время]
FROM 
  [_RallySpecUch] where [Текущий этап]=1
  
SELECT master.sys.fn_varbintohexstr(max(DBTS)) dbts FROM ReplLog where ReplTable=${replTable}  
`;

        let rows = await executeSql(sql);

        //let row = rows[0][0];
        let dbts = rows[1][0]["dbts"];


        if (rows[0] && rows[0].length > 0) {
            let rallySpecUchArray = rows[0].map((row: any) => {

                let rallySpecUch: IRallySpecUch = {
                    id: row["Ключ"],
                    num: row["Номер"],
                    name: row["Название"],
                    date: row["Дата"],
                    length: row["Длина"],
                    timeZone: row["TimeZone"],
                    npp: row["NPP"], // номер по порядку
                    cycleCount: row["Кол.кругов"], // к-во кругов
                    stageDay: row["StageDay"],
                    nameEn: row["НазваниеАнгл"],
                    minTimeMinutes: row["Мин.время"],
                };
                return rallySpecUch;

            });

            return getInstantPromise({rallySpecUch: rallySpecUchArray, dbts: dbts});
        }
        else {
            return getInstantPromise({rallySpecUch: undefined, dbts: dbts});
        }

    }
}

async function LOAD_RALLYPUNKT_handler(req: ILoadRallyPunktReq): Promise<ILoadRallyPunktAns> {
    let replTable = UsersLink_replTable;

    let sql = `select count(1) cnt from ReplLog where ReplTable IN (${replTable},${RallyPunkt_replTable}) and DBTS>${req.dbts || "0x00"}`;
    let count = await getValueFromSql(sql, "cnt");

    if (count === 0)
        return getInstantPromise({rallyPunkt: undefined as any});
    else {
        sql = `
SELECT 
  _RallyPunkt.Ключ,
  _RallyPunkt.Номер,
  _RallyPunkt.Название,
  _RallyPunkt.Length,
  _RallyPunkt.NPP
    
FROM [_RallyPunkt] 
JOIN _RallySpecUch ON _RallySpecUch.Ключ=_RallyPunkt._RallySpecUch
JOIN _UsersLink ON _UsersLink._RallyPunkt=_RallyPunkt.Ключ
WHERE 
  _UsersLink.Login=${stringAsSql(req.login)} AND
  _RallySpecUch.[Текущий этап]=1 
ORDER BY _RallyPunkt.NPP, _RallyPunkt.[№ повтора проезда]  

SELECT master.sys.fn_varbintohexstr(max(DBTS)) dbts FROM ReplLog where ReplTable IN (${replTable},${RallyPunkt_replTable})  
`;

        let rows = await executeSql(sql);

        //console.log("rows", rows);

        //let row = rows[0][0];
        let dbts = rows[1][0]["dbts"];

        //if (row) {

        let rallyPunkts: IRallyPunkt[] = rows[0].map((row: any) => {

            let rallyPunkt: IRallyPunkt = {
                id: row["Ключ"],
                num: row["Номер"],
                name: row["Название"],
                length: row["Length"],
                NPP: row["NPP"]
            };

            return rallyPunkt;
        });


        return getInstantPromise({rallyPunkt: rallyPunkts, dbts: dbts});
        //}
        //else {
        //  return getInstantPromise({rallyPunkt: undefined, dbts: dbts});
        //}

    }
}

async function LOAD_LEGREGISTRATION_handler(req: ILoadLegRegistrationReq): Promise<ILoadLegRegistrationAns> {
    let replTable = LegRegistration_replTable;

    let sql = `select count(1) cnt from ReplLog where ReplTable=${replTable} and DBTS>${req.dbts || "0x00"}`;
    let count = await getValueFromSql(sql, "cnt");

    if (count === 0)
        return getInstantPromise({legRegistration: undefined});
    else {

        sql = `
SELECT 
  _LegRegistration.Ключ id,
  _LegRegistration.Пилот Пилот,
  _LegRegistration.ПилотАнгл ПилотАнгл,
  _LegRegistration.RaceNumber raceNumber,
  _LegRegistration.Автомобиль Автомобиль,
  _LegRegistration.Класс Класс,
  _LegRegistration.Страна Страна
  
FROM _LegRegistration 
JOIN _RallyHeader ON _RallyHeader.Ключ=_LegRegistration._RallyHeader
JOIN _RallySpecUch ON _RallySpecUch._RallyHeader=_LegRegistration._RallyHeader
WHERE 
  _RallySpecUch.[Текущий этап]=1
ORDER BY 
  _LegRegistration.RaceNumber

SELECT master.sys.fn_varbintohexstr(max(DBTS)) dbts FROM ReplLog where ReplTable=${replTable}  
`;

        let rows = await executeSql(sql);

        //console.log("rows", rows);

        let regRows = rows[0];
        let dbts = rows[1][0]["dbts"];

        if (regRows) {
            let legRegistration: ILegRegistration[] = regRows.map((item: any) => {
                // id: number;
                // pilotName: string;
                // pilotNameEn: string;
                // raceNumber: string;
                // autoName:string;
                // autoClass:string;
                // country:string;

                return {
                    id: item["id"],
                    pilotName: item["Пилот"],
                    pilotNameEn: item["ПилотАнгл"],
                    raceNumber: item["raceNumber"],
                    autoName: item["Автомобиль"],
                    autoClass: item["Класс"],
                    country: item["Страна"]

                } as ILegRegistration;

            });

            return getInstantPromise({legRegistration: legRegistration, dbts: dbts});
        }
        else {
            return getInstantPromise({legRegistration: undefined, dbts: dbts});
        }

    }
}

// async function LOAD_PILOTS_handler(req: ILoadPilotsReq): Promise<ILoadPilotsAns> {
//     let replTable = Pilots_replTable;
//
//     let sql = `select count(1) cnt from ReplLog where ReplTable=${replTable} and DBTS>${req.dbts || "0x00"}`;
//     let count = await getValueFromSql(sql, "cnt");
//
//     if (count === 0)
//         return getInstantPromise({pilots: undefined});
//     else {
//
//         sql = `
// SELECT Ключ,Имя,EngName,AutoName FROM _Pilots
// SELECT master.sys.fn_varbintohexstr(max(DBTS)) dbts FROM ReplLog where ReplTable=${replTable}
// `;
//
//         let rows = await executeSql(sql);
//
//         //console.log("rows", rows);
//
//         let pilotsRows = rows[0];
//         let dbts = rows[1][0]["dbts"];
//
//         if (pilotsRows) {
//             let pilots: IPilot[] = pilotsRows.map((item: any) => {
//                 return {
//                     id: item["Ключ"],
//                     name: item["Имя"],
//                     engName: item["EngName"],
//                     autoName: item["AutoName"]
//                 } as IPilot;
//
//             });
//
//             return getInstantPromise({pilots: pilots, dbts: dbts});
//         }
//         else {
//             return getInstantPromise({pilots: undefined, dbts: dbts});
//         }
//
//     }
// }


async function LOAD_CURRENT_EPG_handler(req: ILoadCurrentEpgReq): Promise<ILoadCurrentEpgAns> {

    let sql = `
  EXEC getCurrentEpgNew ${stringAsSql(req.login)},${stringAsSql(req.password)},${stringAsSql(req.category)}
`;

    let rows = await executeSql(sql);

    let epgRows = rows[0];

    let ansEpg: IEpg[] = [];
    for (let row of epgRows) {
        ansEpg.push({
            channelId: row["channelId"],
            channelTitle: row["channelTitle"],
            channelImage: row["channelImage"],
            channelUrl: row["channelUrl"],
            time: sqlDateToStr(row["time"]),
            endtime: sqlDateToStr(row["endtime"]),
            currtime: sqlDateToStr(row["currtime"]),
            title: row["title"],
            categoryTitle: row["categoryTitle"],
            desc: row["desc"],
            genreTitle: row["genreTitle"],
            year: row["year"],
            director: row["director"],
            actors: row["actors"],
            image: row["image"],
            epgProvider: row["provider"],
        } as IEpg);
    }

    return Promise.resolve({epg: ansEpg});

}

async function LOAD_INFO_handler(req: ILoadInfoReq): Promise<ILoadInfoAns> {

    let sql = `
  EXEC getInfo ${req.channelId}, ${stringAsSql(req.time)} 
`;

    let rows = await executeSql(sql);

    let epgRows = rows[0];

    let ansInfo: IInfo[] = [];
    for (let row of epgRows) {
        ansInfo.push({
            channelId: row["channelId"],
            channelTitle: row["channelTitle"],
            channelImage: row["channelImage"],
            time: sqlDateToStr(row["time"]),
            endtime: sqlDateToStr(row["endtime"]),
            currtime: sqlDateToStr(row["currtime"]),
            title: row["title"],
            categoryTitle: row["categoryTitle"],
            desc: row["desc"],
            genreTitle: row["genreTitle"],
            year: row["year"],
            director: row["director"],
            actors: row["actors"],
            image: row["image"],
            epgProvider: row["provider"],
        } as IInfo);
    }

    return Promise.resolve({info: ansInfo[0]});

}


export async function RELOAD_PLAYLIST_handler(req: IReloadPlayListReq): Promise<IReloadPlayListAns> {

    let rows = await executeSql(`SELECT playListUrl FROM [User] WHERE login=${stringAsSql(req.login)} AND password=${stringAsSql(req.password)}`);
    let row = rows[0][0];
    if (!row) throw "RELOAD_PLAYLIST: invalid login/password";
    let playListUrl = row["playListUrl"];

    try {
        let playlist = await loadUtf8FileFromUrl(playListUrl);
        let lines = playlist.split("\r\n");
        if (lines.length < 10)
            throw "неверная ссылка на плейлист";
        let i = 1;

        let sql: string[] = [];
        sql.push("BEGIN TRAN");
        sql.push(`DELETE FROM UserChannel WHERE login=${stringAsSql(req.login)} AND password=${stringAsSql(req.password)}`);

        while (i < lines.length) {
            console.log(lines[i]);
            let extinf = lines[i];
            if (!extinf || !extinf.startsWith("#EXTINF"))
                break;
            i += 1;

            console.log(lines[i]);
            let extgr = lines[i];
            if (!extgr || !extgr.startsWith("#EXTGRP"))
                break;
            i += 1;

            let chUrl = lines[i];
            console.log(chUrl);
            if (!chUrl || !chUrl.startsWith("http"))
                break;
            i += 1;

            let chName = extinf.split(",")[1];
            let chCategory = extgr.split(":")[1];
            if (chCategory.startsWith("дру"))
                chCategory = "прочие";

            sql.push(`IF NOT EXISTS(SELECT 1 FROM UserChannel WHERE login=${stringAsSql(req.login)} AND password=${stringAsSql(req.password)}  AND chName=${stringAsSql(chName)} )`);
            sql.push(`INSERT UserChannel(login,password,chName,chUrl,chCategory) VALUES(${stringAsSql(req.login)},${stringAsSql(req.password)},${stringAsSql(chName)},${stringAsSql(chUrl)},${stringAsSql(chCategory)})`);

        }
        sql.push("COMMIT");

        await executeSql(sql.join("\n"));
        return Promise.resolve({});
        //console.log(sql.join("\n"));

    }
    catch (e) {
        return Promise.reject(e.toString())
    }

}


async function LOAD_ARCH_EPG_handler(req: ILoadArchEpgReq): Promise<ILoadArchEpgAns> {

    let sql = `
  EXEC getArchEpg ${stringAsSql(req.login)},${stringAsSql(req.password)},${req.channelId}
`;

    let rows = await executeSql(sql);

    let epgRows = rows[0];

    let ansEpg: IEpg[] = [];
    for (let row of epgRows) {
        ansEpg.push({
            channelId: row["channelId"],
            channelTitle: row["channelTitle"],
            channelImage: row["channelImage"],
            channelUrl: row["channelUrl"],
            time: sqlDateToStr(row["time"]),
            endtime: sqlDateToStr(row["endtime"]),
            currtime: sqlDateToStr(row["currtime"]),
            title: row["title"],
            categoryTitle: row["categoryTitle"],
            desc: row["desc"],
            genreTitle: row["genreTitle"],
            year: row["year"],
            director: row["director"],
            actors: row["actors"],
            image: row["image"],
            epgProvider: row["provider"],

        } as IEpg);
    }

    return Promise.resolve({epg: ansEpg});

}

async function GET_PLAYLIST_handler(req: IGetPlayListReq): Promise<IGetPlayListAns> {

    let rows = await executeSql(`SELECT playListUrl FROM [User] WHERE login=${stringAsSql(req.login)} AND password=${stringAsSql(req.password)}`);
    let row = rows[0][0];
    if (!row) Promise.reject("GET_PLAYLIST: invalid login/password");
    let playListUrl = row["playListUrl"];
    return Promise.resolve({playList: playListUrl});

}

async function SET_PLAYLIST_handler(req: ISetPlayListReq): Promise<ISetPlayListAns> {
    await executeSql(`UPDATE [User] SET playListUrl=${stringAsSql(req.playList)}  WHERE login=${stringAsSql(req.login)} AND password=${stringAsSql(req.password)}`);
    return RELOAD_PLAYLIST_handler(req);


    // let rows = await executeSql(`SELECT playListUrl FROM [User] WHERE login=${stringAsSql(req.login)} AND password=${stringAsSql(req.password)}`);
    // let row = rows[0][0];
    // if (!row) Promise.reject("GET_PLAYLIST: invalid login/password");
    // let playListUrl = row["playListUrl"];
    // return Promise.resolve({playList: playListUrl});

}

