let https = require('https');
let StringDecoder = require('string_decoder').StringDecoder;

export async function loadFileFromUrl(url: string): Promise<string> {

    return new Promise<string>(
        (resolve: (obj: string) => void, reject: (error: string) => void) => {


            https.get(url, (res:any) => {
                //console.log('statusCode:', res.statusCode);
                //console.log('headers:', res.headers);

                res.on("data", (data:any) => {
                    let decoder = new StringDecoder("utf8");
                    let str = decoder.write(data);
                    resolve(str);
                    //console.log(str);
                });

            }).on("error", (e:any) => {
                reject(e);
                //console.error(e);
            });

        });

}