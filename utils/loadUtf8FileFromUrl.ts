let https = require("https");
let StringDecoder = require("string_decoder").StringDecoder;

export async function loadUtf8FileFromUrl(url: string): Promise<string> {

    return new Promise<string>(
        (resolve: (obj: string) => void, reject: (error: string) => void) => {

            let total:string="";

            https.get(url, (res:any) => {
                //console.log('statusCode:', res.statusCode);
                //console.log('headers:', res.headers);

                res.on("data", (data:any) => {
                    let decoder = new StringDecoder("utf8");
                    let str = decoder.write(data);
                    total+=str;
                    //resolve(str);
                    //console.log(str);
                });

                res.on("end", (data:any) => {
                    resolve(total);
                    //console.log(str);
                });

            }).on("error", (e:any) => {
                reject(e);
                //console.error(e);
            });

        });

}