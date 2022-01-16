import { StringStringObject } from "./types/general";

export const getKeyByValue = (object: StringStringObject, value: string): string | undefined =>
    Object.keys(object).find((key: string) => object[key] === value);

export const isEmptyObject = obj => !obj || !Object.keys(obj).length;

export const toServerDateFormat = date => {
    const yyyy = ('000' + date.getFullYear()).slice(-4);
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);

    return `${yyyy}-${mm}-${dd}`;
};