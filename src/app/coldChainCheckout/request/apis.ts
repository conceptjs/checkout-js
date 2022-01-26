import { Address } from '@bigcommerce/checkout-sdk';
import ccrequest from './base'

import storage from '../utils/storage'
import ccService from '../request';
var _ = require('underscore');

export type AddressIdType = string

export interface Country {
  countryCode: string
  countryName: string
}

export interface State {
  stateCode: string
  stateName: string
}

export interface GetShippingAddressResponseBody {
  addresses: {
    [id: string]: Address
  }
  defaultBillingId: string
  defaultShippingId: string
  billAddresses: any
  TermsCode: string
}

export interface CreateCCOrderReponseBody {
  id: string
  status: string
}

export const getShippingAddress = (): Promise<GetShippingAddressResponseBody> => ccrequest.get('/store/checkout/addresses');
export const createCCOrder = async (cart:any): Promise<CreateCCOrderReponseBody> => {
  try {
    var data = _.extend(cart, {
      "CCNeedBy": storage.CCNeedBy.getValue(),
      "CCShipWhenComplete": storage.CCShipWhenComplete.getValue(),
      "CCShippingPreference": storage.CCShippingPreference.getValue(),
      "CCReferLine": storage.CCReferLine.getValue(),
      "CCPoNumber": storage.CCPoNumber.getValue(),
      "CCSelectShippingAddressId": storage.CCSelectShippingAddressId.getValue()
    });

    const bcToken = await ccService.bcApi.getBcToken();
    storage.BCToken.setValue(bcToken);
    return await ccrequest.post('/store/checkout/order', data);
  } catch (err) {
    throw new Error("Something is wrong when creating ERP order, please contact the customer support to resolve the issue.");
  }
}