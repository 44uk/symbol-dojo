/**
 * Replace NetworkCurrencyMosaic.NAMESPACE_ID workaround.
 */
import {
  NamespaceId,
  NetworkCurrencyMosaic,
} from "nem2-sdk"

NetworkCurrencyMosaic.NAMESPACE_ID = new NamespaceId("nem.xem")
