import { NetworkType } from "symbol-sdk";

export class HumanReadableConvertError extends Error {}

export function networkType(value: NetworkType) {
    // @ts-ignore
    const found = Object.keys(NetworkType).find((key) => NetworkType[key] === value)
    if (! found) throw new HumanReadableConvertError(`Unsupported value: ${value}`)
    return found
}

export default {
    networkType
}