
export default function Utils() {

    const yyyyMMddHHmmss = () => {
        // クラスのインスタンス化
        const currentDate = new Date();
        // 年
        const year = currentDate.getFullYear();
        // 月
        const month = currentDate.getMonth() + 1;
        // 日
        const day = currentDate.getDate();
        // 曜日のリスト
        const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
        // 曜日の番号を取得
        const weekNumber = currentDate.getDay();
        // 時間
        const hour = currentDate.getHours();
        // 分
        const min = currentDate.getMinutes();
        // 秒
        const sec = currentDate.getSeconds();
        // ミリ秒
        const msec = currentDate.getMilliseconds();

        const date =
            year +
            String(month).padStart(2, "0") +
            String(day).padStart(2, "0") +
            String(hour).padStart(2, "0") +
            String(min).padStart(2, "0") +
            String(sec).padStart(2, "0");
        return date;
    };

    const objectEquals = (a: any, b: any): boolean => {

        if (a === b) {
            // 同一インスタンスならtrueを返す
            return true;
        }

        if (a === null || a === undefined || b === null || b === undefined) {
            return false;
        }

        // 比較対象双方のキー配列を取得する（順番保証のためソートをかける）
        const aKeys = Object.keys(a).sort();
        const bKeys = Object.keys(b).sort();

        // 比較対象同士のキー配列を比較する
        if (aKeys.toString() !== bKeys.toString()) {
            // キーが違う場合はfalse
            return false;
        }

        // 値をすべて調べる。
        const wrongIndex = aKeys.findIndex(function (value) {
            // 注意！これは等価演算子で正常に比較できるもののみを対象としています。
            // つまり、ネストされたObjectやArrayなどには対応していないことに注意してください。
            //Nan同士は===だとfalseを返すためObject.isを使用
            return !Object.is(a[value], b[value]);
        });

        // 合致しないvalueがなければ、trueを返す。
        return wrongIndex === -1;
    };

    return {
        objectEquals,
        yyyyMMddHHmmss
    }
}



