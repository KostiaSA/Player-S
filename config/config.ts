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
    sqlServerAddress: "81.177.142.4",
    sqlServerInstance: "",
    sqlServerPort: 1433,
    sqlLogin: "sa",
    sqlPassword: "sonyk",
    sqlDatabase: "EdemTV",
    port:3001,
    staticPath:"c:/--EdemPlayer--/S/static"
//    staticPath:"c:/--EdemPlayer--/a/www"
}

let cloudDir: IConfig = {
    sqlServerAddress: "127.0.0.1",
    sqlServerInstance: "",
    sqlServerPort: 1433,
    sqlLogin: "sa",
    sqlPassword: "sonyk",
    sqlDatabase: "EdemTV",
    port:80,
    staticPath:"c:/--EdemPlayer--/S/static"
}


export let config :IConfig = developHomeDir;
//изменено 888