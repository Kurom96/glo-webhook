import {app} from './server';

// こいつはもうつかわねーです
app.listen(8080, () => {
    console.log(`Listening for Glo webhooks on port 8080`);
});
