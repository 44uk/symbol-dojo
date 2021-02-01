/**
 * Workaround:
 * Replace NetworkCurrencyMosaic.NAMESPACE_ID.
 */
import {
  Currency
} from "symbol-sdk"

// @ts-ignore
Currency.PUBLIC.mosaicId= new MosaicId("5B66E76BECAD0860")
