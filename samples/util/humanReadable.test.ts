import { NetworkType } from "symbol-sdk"
import hr, {
    HumanReadableConvertError
} from "./humanReadable"

describe("networkType", () => {
    test.each`
        value | expected
        ${NetworkType.MAIN_NET}     | ${"MAIN_NET"}
        ${NetworkType.MIJIN}        | ${"MIJIN"}
        ${NetworkType.MIJIN_TEST}   | ${"MIJIN_TEST"}
        ${NetworkType.PRIVATE}      | ${"PRIVATE"}
        ${NetworkType.PRIVATE_TEST} | ${"PRIVATE_TEST"}
        ${NetworkType.TEST_NET}     | ${"TEST_NET"}
    `("convert to Human Readable.", ({ value, expected }) => {
        expect(hr.networkType(value)).toBe(expected)
    })

    test("throw error when receive unsupported type", () => {
        expect(() => hr.networkType(0)).toThrow(HumanReadableConvertError)
    })
})