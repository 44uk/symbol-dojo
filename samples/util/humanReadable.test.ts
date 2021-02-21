import { NetworkType, TransactionType } from "symbol-sdk"
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

describe("transactionType", () => {
    test.each`
        value | expected
        ${TransactionType.ACCOUNT_ADDRESS_RESTRICTION} | ${'ACCOUNT_ADDRESS_RESTRICTION'}
        ${TransactionType.ACCOUNT_KEY_LINK}   | ${'ACCOUNT_KEY_LINK'}
        ${TransactionType.ACCOUNT_METADATA}   | ${'ACCOUNT_METADATA'}
        ${TransactionType.ACCOUNT_MOSAIC_RESTRICTION} | ${'ACCOUNT_MOSAIC_RESTRICTION'}
        ${TransactionType.ACCOUNT_OPERATION_RESTRICTION} | ${'ACCOUNT_OPERATION_RESTRICTION'}
        ${TransactionType.ADDRESS_ALIAS}      | ${'ADDRESS_ALIAS'}
        ${TransactionType.AGGREGATE_BONDED}   | ${'AGGREGATE_BONDED'}
        ${TransactionType.AGGREGATE_COMPLETE} | ${'AGGREGATE_COMPLETE'}
        ${TransactionType.HASH_LOCK}          | ${'HASH_LOCK'}
        ${TransactionType.MOSAIC_ADDRESS_RESTRICTION} | ${'MOSAIC_ADDRESS_RESTRICTION'}
        ${TransactionType.MOSAIC_ALIAS}       | ${'MOSAIC_ALIAS'}
        ${TransactionType.MOSAIC_DEFINITION}  | ${'MOSAIC_DEFINITION'}
        ${TransactionType.MOSAIC_GLOBAL_RESTRICTION} | ${'MOSAIC_GLOBAL_RESTRICTION'}
        ${TransactionType.MOSAIC_METADATA}    | ${'MOSAIC_METADATA'}
        ${TransactionType.MOSAIC_SUPPLY_CHANGE} | ${'MOSAIC_SUPPLY_CHANGE'}
        ${TransactionType.MULTISIG_ACCOUNT_MODIFICATION} | ${'MULTISIG_ACCOUNT_MODIFICATION'}
        ${TransactionType.NAMESPACE_METADATA}     | ${'NAMESPACE_METADATA'}
        ${TransactionType.NAMESPACE_REGISTRATION} | ${'NAMESPACE_REGISTRATION'}
        ${TransactionType.NODE_KEY_LINK}   | ${'NODE_KEY_LINK'}
        ${TransactionType.RESERVED}        | ${'RESERVED'}
        ${TransactionType.SECRET_LOCK}     | ${'SECRET_LOCK'}
        ${TransactionType.SECRET_PROOF}    | ${'SECRET_PROOF'}
        ${TransactionType.TRANSFER}        | ${'TRANSFER'}
        ${TransactionType.VOTING_KEY_LINK} | ${'VOTING_KEY_LINK'}
        ${TransactionType.VRF_KEY_LINK}    | ${'VRF_KEY_LINK'}
    `("convert to Human Readable.", ({ value, expected }) => {
        expect(hr.transactionType(value)).toBe(expected)
    })

    test("throw error when receive unsupported type", () => {
        expect(() => hr.transactionType(99999)).toThrow(HumanReadableConvertError)
    })
})


