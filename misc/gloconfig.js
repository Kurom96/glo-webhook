import request from 'request-promise';
import config from '../src/config';
import {createInterface} from 'readline';

const getRequest = url => {
    const headers = {
        'Authorization': `Bearer ${config.glo.token}`,
        'Content-type': 'application/json',
        'external-tokens': JSON.stringify({'GitHub': config.github.token})
    };
    const options = {url, headers};
    return request.get(options);
};

const getBoards = () => {
    const url = `https://gloapi.gitkraken.com/v1/glo/boards`;
    return getRequest(url);
};

const askWitchBoard = bodyString => {
    const body = JSON.parse(bodyString);
    body.forEach((board, index) => console.log(`${index + 1}: ${board.name}`));
    console.log("x: やっぱやめる");

    return new Promise((resolve, reject) => {
        const readline = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readline.question(`どのボードの情報を表示しますか？`, res => {
            readline.close();

            const num = Number(res);
            if (!Number.isFinite(num)) {
                return reject();
            }

            const index = num - 1;
            const board = body[index];
            if (!board) {
                return reject();
            }
            resolve(board.id);
        });
    });
};

const getBoard = board => {
    const url = encodeURI(`https://gloapi.gitkraken.com/v1/glo/boards/${board}?fields=name,labels,columns`);
    return getRequest(url);
};

const showResult = bodyString => {
    const body = JSON.parse(bodyString);
    console.log("----- labls -----");
    body.labels.forEach(({name, id}) => console.log(`  ${id}: ${name}`));
    console.log("----- columns -----");
    body.columns.forEach(({name, id}) => console.log(`  ${id}: ${name}`));
};

getBoards()
    .then(askWitchBoard)
    .then(getBoard)
    .then(showResult)
    .catch(() => console.log("設定値取得失敗…"));
