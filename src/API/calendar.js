import { google } from 'googleapis';
import moment from 'moment-timezone';
import { config } from 'firebase-functions';
import setting from "../setting";

// スケジュール登録するカラムID
const SCHEDULE_COLUMN_ID = setting.glo.columns[setting.calendar.scheduleColumn];

/**
 * イベント登録
 * @param {Object} card
 * @return {Promise<void>}
 */
export function insertEvent(card) {
    return new Promise((resolve, reject) => {
        if (card.column_id !== SCHEDULE_COLUMN_ID) {
            resolve();
            return;
        }

        console.log("承認カラム…！！？");
        const oAuth2Client = _createOAuth2Client();
        const calendar = google.calendar({version: 'v3', auth: oAuth2Client});

        const defaultResource = {
            summary: 'デフォルト',
            description: '',
            start: {
                date: "2020-01-01"
            },
            end: {
                date: "2020-01-02"
            },
            attendees: [],
            reminders: {
                useDefault: false
            }
        };
        const options = {
            calendarId: 'primary',
            sendNotifications: false,
            sendUpdates: 'none',
            resource: Object.assign({}, defaultResource, _createResourceFromCard(card))
        };

        calendar.events.insert(options, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

/**
 * OAuth2 クライアント作成
 * @return {OAuth2Client}
 * @private
 */
function _createOAuth2Client() {
    const {client_secret, client_id} = config().google.calendar.credentials;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);
    oAuth2Client.setCredentials({
        "refresh_token": config().google.calendar.refresh_token,
        "scope": "https://www.googleapis.com/auth/calendar",
        "token_type": "Bearer"
    });
    return oAuth2Client;
}

/**
 * カードからカレンダーに登録するリソースを作成する
 * @param card
 * @return {{summary: *, reminders: {useDefault: boolean}, attendees: {email: string}[], start: {date: string}, description: string, end: {date: string}}}
 * @private
 */
function _createResourceFromCard(card) {
    moment.tz.setDefault('Asia/Tokyo');
    const targetDate = moment(card.due_date);
    return {
        summary: card.name,
        description: card.description ? card.description.text : "",
        start: {
            date: targetDate.format("YYYY-MM-DD")
        },
        end: {
            date: targetDate.add(1, "day").format("YYYY-MM-DD")
        },
        attendees: [
            { email: 'kuroda@socketbase.co.jp' }
        ],
        reminders: {
            useDefault: false
        }
    };
}
