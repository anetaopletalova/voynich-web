import { StringStringObject } from "./types/general";

export const getKeyByValue = (object: StringStringObject, value: string): string | undefined =>
    Object.keys(object).find((key: string) => object[key] === value);
