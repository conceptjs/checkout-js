import { Address } from '@bigcommerce/checkout-sdk';
import ccrequest from './base'

import storage from '../utils/storage'
import ccService from '../request';
import envConfig from './envConfig'
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
  company: string
  groupName: string
  AllowOTS: boolean
  shipVias: any
}

export interface CreateCCOrderReponseBody {
  id: string
  status: string
}

const env: string = process.env.NODE_ENV === 'none' ? 'staging' : process.env.NODE_ENV ?? 'production'

export const getShippingAddress = (): Promise<GetShippingAddressResponseBody> => ccrequest.get('/store/checkout/addresses');
export const createCCOrder = async (cart:any): Promise<CreateCCOrderReponseBody> => {
  try {
    var data = _.extend(cart, {
      "CCNeedBy": storage.CCNeedBy.getValue(),
      "CCShipWhenComplete": storage.CCShipWhenComplete.getValue(),
      "CCShippingPreference": storage.CCShippingPreference.getValue(),
      "CCReferLine": storage.CCReferLine.getValue(),
      "CCPoNumber": storage.CCPoNumber.getValue(),
      "CCSelectShippingAddressId": storage.CCSelectShippingAddressId.getValue(),
      "CCShipVia": storage.CCShipVia.getValue(),
      "CCShippingMethod": storage.CCShippingMethod.getValue(),
      "CCOTSAddress": JSON.parse((storage.CCOTSAddress.getValue())?storage.CCOTSAddress.getValue():"{}")
    });

    const bcToken = await ccService.bcApi.getBcToken(undefined);
    storage.BCToken.setValue(bcToken);

    return await ccrequest.post('/store/checkout/order', data);
  } catch (err) {
    throw new Error("Something is wrong when creating ERP order, please contact the customer support to resolve the issue.");
  }
}

export const addPONumber = async (cart:any, orderId:any): Promise<any> =>{
  try {
    console.log("orderId;" + orderId)+", customerId:"+cart.customerId;
    //storage.B3AuthToken.setValue("");

    const bcToken = await ccService.bcApi.getBcToken(envConfig[env].bundleB2BClientId);

    storage.B3AuthToken.setValue(bcToken);
    
    const { token } = await ccService.bundleb2bApis.getToken({
      bcToken: bcToken,
      customerId: cart.customerId,
      storeHash: envConfig[env].storeHash,
    });

    storage.B3AuthToken.setValue(token);

    return await ccService.bundleb2bApis.addPoNumber({
      orderId: orderId,
      poNumber: storage.CCPoNumber.getValue()
    });
    
  /*   
    return await ccrequest.put('/b3/order', {
      orderId: orderId,
      poNumber: storage.CCPoNumber.getValue()
    });
    */
    
  } catch (err) {
    console.log("addPONumber err:"+err);
    //throw new Error("Something is wrong when adding PO number, please contact the customer support to resolve the issue.");
  }
}