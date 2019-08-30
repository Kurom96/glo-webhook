import {app} from './server';
import {https} from 'firebase-functions';

exports.gloWebhook = https.onRequest(app);
