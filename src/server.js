import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';

import config from './config';
import { verifyOnAdded, setColumnLabel } from './API/Card';

const createSignature = (buf) => {
    const hmac = crypto.createHmac('sha1', config.glo.secret);
    hmac.update(buf, 'utf-8');
    return 'sha1=' + hmac.digest('hex');
};

const verifyWebhookSignature = (req, res, next) => {
    // Firebase Cloud Function用の避け
    req.buf = req.buf || JSON.stringify(req.body);

    const signature = createSignature(req.buf);
    if (signature !== req.headers['x-gk-signature']) {
        return res.status(403).send('invalid signature');
    }

    next();
};

export const app = express();

app.use(bodyParser.json({
    // verify normally allows us to conditionally abort the parse, but we're using
    // to gain easy access to 'buf', which is a Buffer of the raw request body,
    // which we will need later when we validate the webhook signature
    verify: (req, res, buf) => {
        // express で受信する時はここを通過するけど、
        // Firebase Cloud Function に app を食わせるとここを通過しない
        req.buf = buf;
    }
}));

app.use(verifyWebhookSignature);

app.post('*', (req, res) => {
    console.log('Received Glo webhook payload', new Date());
    console.log('Event', req.headers['x-gk-event']);
    // console.log(req.body);
    // if (req.body.labels && req.body.labels.added) {
    //     console.log(req.body.labels.added);
    // }


    let p = Promise.resolve();
    if (req.headers['x-gk-event'] === 'cards') {
        if (req.body.action === 'added') {
            p = verifyOnAdded(req.body.card, req.body.sender);
        }

        if (req.body.action === 'moved_column') {
            p = setColumnLabel(req.body.card, req.body.sender);
        }

        // ラベル変更時に対応するカラムに移動する処理
        // Github でのラベル付与駆動にしようかと思ったけど、Github からの変更反映は Glo の Webhook が検知しないのでボツ
        // if (req.body.action === 'labels_updated') {
        //     p = moveColumnFromLabel(req.body.card, req.body.labels.added);
        // }
    }

    p.then(body => {
        console.log(body);
    }).catch(err => {
        console.error(err);
    }).finally(() => {
        res.sendStatus(204);
    })
});

