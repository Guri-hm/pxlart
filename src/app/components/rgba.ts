import { NaNColor } from '../hooks/useStrokes';
import Utils from '../utils/utils';
import { ColorType } from './strokeTypes'

export const concatRegExps = (regExps: RegExp[], flags?: string): RegExp => {
    return RegExp(regExps.reduce((acc, cur) => acc + cur.source, ''),
        flags,
    );
};
const { objectEquals } = Utils();

const rgbaStrToValues = (rgba: string): ColorType | null => {
    const regExp = concatRegExps([
        /^rgba?\( *([+-]?\d*\.?\d+) *, *([+-]?\d*\.?\d+) *, */, // rgb[a](R, G,
        /([+-]?\d*\.?\d+)(?: *, *([+-]?\d*\.?\d+) *)?\)$/, // B[, A])
    ]);

    const result = regExp.exec(rgba);
    if (!result) { return null; }

    const { 1: red, 2: green, 3: blue, 4: alpha } = result;
    if (!(red && green && blue)) { return null; }

    const { min, max } = Math;
    return {
        r: max(min(Number(red), 255), 0),
        g: max(min(Number(green), 255), 0),
        b: max(min(Number(blue), 255), 0),
        a: alpha ? max(min(Number(alpha), 1), 0) : 1,
    };
}

const to0padHex = (value: number | undefined) => {
    if (typeof value == 'undefined') {
        return "00";
    }
    return ("0" + value.toString(16)).slice(-2);
}

export const getDictRGBA = (rgba: string): ColorType | null => {

    return rgbaStrToValues(rgba);
};

export const getHex = (rgba: string | ColorType): string => {

    if (objectEquals(rgba, NaNColor)) {
        return ""
    }
    let colors: ColorType;
    if (typeof rgba == "string") {
        colors = rgbaStrToValues(rgba)!;
    } else {
        colors = rgba;
    }
    return '#' + to0padHex(colors.r) + to0padHex(colors.g) + to0padHex(colors.b);
};

export const invertColor = (hex: any): string => {
    const rgb = hex!.match(
        /[0-9a-fA-F]{1,2}/g
    ).reduce((p: any, c: any) => {
        p.push(parseInt(c, 16));
        return p;
    }, []);
    const minmax = Math.min(...rgb) + Math.max(...rgb);

    // 特別なケース: 黒の場合は白を返す
    if (rgb.every((c: any) => c === 0)) {
        return '#FFFFFF';
    }

    // 特別なケース: 白の場合は黒を返す
    if (rgb.every((c: any) => c === 255)) {
        return '#000000';
    }

    return rgb.reduce((p: any, c: any) => {
        p += (minmax - c).toString(16).padStart(2, '0');
        return p;
    }, '#')
}



