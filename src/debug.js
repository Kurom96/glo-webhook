import {app} from './server';
import config from './config';

app.listen(config.http.port, () => {
    console.log(`Listening for Glo webhooks on port ${config.http.port}`);
});
