import fs from 'fs';
import {google} from 'googleapis';
import getAccessToken from './getAccessToken';
import {config} from 'firebase-functions';

const TOKEN_PATH = 'token.json';

listEvents();

/**
 * 認証（ブラウザ）
 * @return {Promise<any>}
 */
function getAuthorize() {
    return new Promise((resolve, reject) => {
        const {client_secret, client_id, redirect_uri} = config().google.calendar.credentials;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                getAccessToken(oAuth2Client)
                    .then(token => {
                        oAuth2Client.setCredentials(token);
                        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                            if (!err) {
                                console.log('Token stored to', TOKEN_PATH);
                            }
                            resolve(oAuth2Client);
                        });
                    })
                    .catch(reject);
                return;
            }
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        });
    });
}

/**
 * 一覧取得
 */
export async function listEvents() {
    const oAuth2Client = await getAuthorize().catch(() => null);
    if (!oAuth2Client) {
        console.error('認証エラーが発生しました。');
        return;
    }
    const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, (err, res) => {
        if (err) {
            return console.log(`API がエラーを返却しました。 ${err}`);
        }
        const events = res.data.items;
        if (events.length) {
            console.log('イベント10個');
            events.map((event, index) => {
                // const start = event.start.dateTime || event.start.date;
                // console.log(`${start} - ${event.summary}`);
                console.log(JSON.stringify(event));
            })
        } else {
            console.log('イベントがありません。');
        }
    });
}

/**
 * イベント登録
 * @return {Promise<void>}
 */
export async function insertEvent() {
    const oAuth2Client = await getAuthorize().catch(() => null);
    if (!oAuth2Client) {
        console.error('認証エラーが発生しました。');
        return;
    }

    const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
    const options = {
        calendarId: 'primary',
        sendNotifications: false,
        sendUpdates: 'none',
        resource: {
            summary: 'テスト：APIで登録3',
            description: 'この予定の詳細です',
            start: {
                date: "2019-09-07"
            },
            end: {
                date: "2019-09-08"
            },
            attendees: [
                {'email': 'kuroda@socketbase.co.jp'},
                {'email': 'takahiro@socketbase.co.jp'}
            ],
            reminders: {
                useDefault: false
            }
        }
    };

    calendar.events.insert(options, (err, res) => {
        if (err) {
            return console.log(`API がエラーを返却しました。 ${err}`);
        }
        console.log(JSON.stringify(res));
    });
}
