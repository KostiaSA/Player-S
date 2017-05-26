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

let cloudW: IConfig = {
    sqlServerAddress: "127.0.0.1",
    sqlServerInstance: "",
    sqlServerPort: 1433,
    sqlLogin: "sa",
    sqlPassword: "sonyk",
    sqlDatabase: "EdemTV",
    port:80,
    staticPath:"c:/--EdemPlayer--/W/www"
}

let dirW: IConfig = {
    sqlServerAddress: "player.buhta.ru",
    sqlServerInstance: "",
    sqlServerPort: 1433,
    sqlLogin: "sa",
    sqlPassword: "sonyk",
    sqlDatabase: "EdemTV",
    port:3001,
    staticPath:"c:/--EdemPlayer--/W/www"
}

let dirA: IConfig = {
    sqlServerAddress: "player.buhta.ru",
    sqlServerInstance: "",
    sqlServerPort: 1433,
    sqlLogin: "sa",
    sqlPassword: "sonyk",
    sqlDatabase: "EdemTV",
    port:3001,
    staticPath:"c:/--EdemPlayer--/A/www"
}


export let config :IConfig = dirA;
//изменено 888-999