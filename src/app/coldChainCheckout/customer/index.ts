import { CheckoutStoreSelector, CheckoutService } from '@bigcommerce/checkout-sdk'
import { storage } from '../utils'

import ccService from '../request';

const init = async (data: CheckoutStoreSelector, service: CheckoutService) => {
  const customer = data.getCustomer()
  service

  try {
    const bcToken = await ccService.bcApi.getBcToken(undefined);
    const cart = data.getCart();
    storage.BCToken.setValue(bcToken);
    storage.BCCustomer.setValue(customer);
    storage.BCCart.setValue(JSON.stringify(cart));
  } finally {
  }
}

const logout = () => {
  storage.clear()
}

export default {
  init,
  logout,
}
