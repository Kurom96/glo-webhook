import {createInterface} from 'readline';

const SCOPE = ['https://www.googleapis.com/auth/calendar'];

// getAccessToken()
//     .then(() => console.log("done"))
//     .catch(err => console.error(err));

export default function getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPE
        });
        console.log('以下のURLにアクセスしてトークンを取得してください。');
        console.log(authUrl);

        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readline.question('表示されたコードを入力してください：', code => {
            readline.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token);
            });
        });
    });
}
