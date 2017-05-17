export interface IConfig {
    sqlServerAddress: string;
    sqlServerInstance: string;
    sqlServerPort: number;
    sqlLogin: string;
    sqlPassword: string;
    sqlDatabase: string;
    port:number;
    staticPath:string;
}

let developHomeDir: IConfig = {
    sqlServerAddress: "CAR",
    sqlServerInstance: "",
    sqlServerPort: 1433,
    sqlLogin: "sa",
    sqlPassword: "sonyk",
    sqlDatabase: "EdemTV",
    port:3001,
    staticPath:"c:/--EdemPlayer--/S/static"
//    staticPath:"c:/--EdemPlayer--/a/www"
}

// let cloudDir: IConfig = {
//     sqlServerAddress: "online.bajarussia.xxx",
//     sqlServerInstance: "",
//     sqlServerPort: 1433,
//     sqlLogin: "sa",
//     sqlPassword: "12KloP09",
//     sqlDatabase: "Rally",
//     port:3001,
//     staticPath:"c:/rally/a/www"
// }


export let config :IConfig = developHomeDir;