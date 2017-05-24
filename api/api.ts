export const CheckPoint_replTable = 2;
export const LegRegistration_replTable = 3;
export const Pilots_replTable = 4;
export const RallyHeader_replTable = 5;
export const RallySpecUch_replTable = 11;
export const RallyPunkt_replTable = 7;
export const UsersLink_replTable = 9;


export const BAD_ENCRYPT_KEY_ERROR = "BAD_ENCRYPT_KEY_ERROR";
export const BAD_LOGIN_PASSWORD = "Неверный логин или пароль";


export interface IReq {
    cmd: string;
}

export interface IAns {
    error?: string;
}


// -------  GET_ENCRYPT_KEY ----------
export const GET_ENCRYPT_KEY_CMD = "1";

export interface IGetEncryptKeyReq extends IReq {

}
export interface IGetEncryptKeyAns extends IAns {
    encryptKey: string;
}


// -------  LOGIN ----------
export const LOGIN_CMD = "2";

export interface ILoginReq extends IReq {
    login: string;
    password: string;
}

export interface ILoginAns extends IAns {
    user: string
}


// -------  RallyHeader ----------
export interface IRallyHeader {
    id: number;
    num: string;
    name: string;
    begDate: Date;
    endDate: Date;
    place: string;
}

export const LOAD_RALLYHEADER_CMD = "3";

export interface ILoadRallyHeaderReq extends IReq {
    dbts: string;
}

export interface ILoadRallyHeaderAns extends IAns {
    rallyHeader?: IRallyHeader;
    dbts?: string;
}


// -------  Pilots ----------
// export interface IPilot {
//     id: number;
//     name: string;
//     engName: string;
//     autoName: string;
// }
//
// export const LOAD_PILOTS_CMD = "4";
//
// export interface ILoadPilotsReq extends IReq {
//     dbts: string;
// }
//
// export interface ILoadPilotsAns extends IAns {
//     pilots?: IPilot[];
//     dbts?: string;
// }

// -------  RallySpecUch ----------
export interface IRallySpecUch {
    id: number;
    num: string;
    name: string;
    date: Date;
    length: number;
    timeZone: number;  // в часах, (МСК это +3)
    npp: number; // номер по порядку
    cycleCount: number; // к-во кругов
    stageDay: number;
    nameEn: string;
    minTimeMinutes: number;
}

export const LOAD_RALLYSPECUCH_CMD = "5";

export interface ILoadRallySpecUchReq extends IReq {
    dbts: string;
}

export interface ILoadRallySpecUchAns extends IAns {
    rallySpecUch?: IRallySpecUch[];
    dbts?: string;
}

// -------  RallyPunkt ----------
export interface IRallyPunkt {
    id: number;
    num: string;
    NPP: string;
    name: string;
    length: number;
}

export const LOAD_RALLYPUNKT_CMD = "6";

export interface ILoadRallyPunktReq extends IReq {
    login: string;
    dbts: string;
}

export interface ILoadRallyPunktAns extends IAns {
    rallyPunkt: IRallyPunkt[];
    dbts?: string;
}

// -------  LegRegistration ----------
export interface ILegRegistration {
    id: number;
    pilotName: string;
    pilotNameEn: string;
    raceNumber: string;
    autoName: string;
    autoClass: string;
    country: string;
}

export const LOAD_LEGREGISTRATION_CMD = "7";

export interface ILoadLegRegistrationReq extends IReq {
    dbts: string;
}

export interface ILoadLegRegistrationAns extends IAns {
    legRegistration?: ILegRegistration[];
    dbts?: string;
}

// -------  CheckPoint ----------
export interface ICheckPoint {
    legRegsId: number;
    rallyPunktId: number;
    checkTime: Date;
//    penaltyTime: Date;

    mobileId: string;
    mobileTime: Date;
    mobileLogin: string;
    mobileDevice: string;
    syncOk: boolean;
}

export const LOAD_CHECKPOINTS_CMD = "8";

export interface ILoadCheckPointsReq extends IReq {
    rallyPunktId: number;
    dbts: string;
}

export interface ILoadCheckPointsAns extends IAns {
    checkPoints?: ICheckPoint[];
    dbts?: string;
}

export const SAVE_CHECKPOINTS_CMD = "9";

export interface ISaveCheckPointsReq extends IReq {
    checkPoints: ICheckPoint[];
}

export interface ISaveCheckPointsAns extends IAns {

}


////////////**************************///////////////
////////////**************************///////////////
////////////**************************///////////////
////////////**************************///////////////

export interface IEpg {
    channelId: number;
    channelTitle: string;
    channelImage: string;
    channelUrl: string;
    time: string;
    endtime: string;
    currtime: string;
    title: string;
    categoryTitle: string;
    desc: string;
    genreTitle: string;
    year: string;
    director: string;
    actors: string;
    image: string;
    epgProvider: string;
}


export interface IInfo {
    channelId: number;
    channelTitle: string;
    channelImage: string;
    time: string;
    endtime: string;
    title: string;
    categoryTitle: string;
    desc: string;
    genreTitle: string;
    year: string;
    director: string;
    actors: string;
    image: string;
    epgProvider: string;
}


export const LOAD_CURRENT_EPG = "101";

export interface ILoadCurrentEpgReq extends IReq {
    login: string;
    password: string;
    category:string;
}

export interface ILoadCurrentEpgAns extends IAns {
    epg: IEpg[];
}

export const LOAD_INFO = "102";

export interface ILoadInfoReq extends IReq {
    channelId:number;
    time:string;
}

export interface ILoadInfoAns extends IAns {
    info: IInfo;
}


export const RELOAD_PLAYLIST = "103";

export interface IReloadPlayListReq extends IReq {
    login: string;
    password: string;
}

export interface IReloadPlayListAns extends IAns {
}

export const LOAD_ARCH_EPG = "104";

export interface ILoadArchEpgReq extends IReq {
    login: string;
    password: string;
    channelId:number;
}

export interface ILoadArchEpgAns extends IAns {
    epg: IEpg[];
}
