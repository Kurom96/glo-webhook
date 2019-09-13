import {app} from './server';
import {https, config} from 'firebase-functions';

exports.gloWebhook = https.onRequest(app);

exports.configTest = https.onRequest((req, res) => {
    console.log(JSON.stringify(config()));
    res.sendStatus(204);
});
