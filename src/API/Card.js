import request from 'request-promise';
import config from '../config';

const {board, columns, labels} = config.glo;

// 同じキー文字列を持つカラムとラベルを連結させるための Map
const COLUMN_LABEL_MAP = new Map(Object.keys(columns).map(key => [columns[key], labels[key] || null]));
const LABEL_COLUMN_MAP = new Map(Object.keys(labels).map(key => [labels[key], columns[key] || null]));

// 管理者しか移動できないカラム
const LIMITED_COLUMNS = config.admin.limited.columns.map(key => columns[key]);

/**
 * 不正なカラム移動が検知された。
 * ラベルを手がかりに元のカラムに戻す。
 */
const rollback = (card) => {
    const targetLabel = card.labels.find(label => LABEL_COLUMN_MAP.get(label.id));
    const column_id = targetLabel ? LABEL_COLUMN_MAP.get(targetLabel.id) : columns.progress;
    return send(card, JSON.stringify({column_id}));
};

/**
 * 管理者限定の操作であるか
 * @param card
 * @return {boolean}
 */
const isLimitedOperation = (card) => {
    return LIMITED_COLUMNS.includes(card.column_id);
};

/**
 * カード更新リクエスト送信
 * @param card
 * @param body
 */
const send = (card, body) => {
    const url = `https://gloapi.gitkraken.com/v1/glo/boards/${board}/cards/${card.id}`;
    const headers = {
        'Authorization': `Bearer ${config.glo.token}`,
        'Content-type': 'application/json',
        'external-tokens': JSON.stringify({'GitHub': config.github.token})
    };
    const options = {url, headers, body};

    return request.post(options);
};

/**
 * カラム移動時にラベルを付け外しする
 * @param card
 * @param sender
 */
export function setColumnLabel(card, sender) {
    if (isLimitedOperation(card) && !config.admin.users.includes(sender.username)) {
        return rollback(card);
    }

    if (!COLUMN_LABEL_MAP.has(card.column_id)) {
        return Promise.resolve();
    }

    const targetLabelId = COLUMN_LABEL_MAP.get(card.column_id);
    const isAlready = !!targetLabelId && card.labels.some(label => label.id === targetLabelId);
    if (isAlready) {
        return Promise.resolve();
    }

    // 移動先のカラムに対応するラベル以外は削除
    const labels = (card.labels || []).filter(({id}) => {
        const values = Array.from(COLUMN_LABEL_MAP.values());
        return !values.some(value => id === value)
    });
    if (targetLabelId) {
        labels.push({'id': targetLabelId});
    }

    return send(card, JSON.stringify({labels}));
}

/**
 * ラベル変更時に対応するカラムに移動する処理（ボツ案）
 *   - Github でのラベル付与駆動にしようかと思ったが Github からの変更は Glo の Webhook が検知しないのでボツ
 * @param card
 * @param addedLabels
 */
export function moveColumnFromLabel(card, addedLabels = []) {
    const targetLabel = addedLabels.find(label => LABEL_COLUMN_MAP.get(label.id));
    if (!targetLabel) {
        return Promise.resolve();
    }

    const column_id = LABEL_COLUMN_MAP.get(targetLabel.id);

    return send(card, JSON.stringify({ column_id }))
}

/**
 * カード追加時は必ず作業中カラムにする
 * @param card
 */
export function verifyOnAdded(card) {
    if (card.column_id === columns.progress) {
        return Promise.resolve();
    }

    const column_id = columns.progress;
    return send(card, JSON.stringify({ column_id }))
}
