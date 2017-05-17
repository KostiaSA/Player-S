import {loadUtf8FileFromUrl} from "../utils/loadUtf8FileFromUrl";
import {RELOAD_PLAYLIST_handler} from "../responses";

//loadUtf8FileFromUrl("https://edem.tv/playlists/uplist/5484a876bcacc75e414ae5d9f0c88270/edem_pl.m3u8");

RELOAD_PLAYLIST_handler({login:"212850",password:"31025"} as any);