const CCStorageSchema = {
  CCNeedBy: "CCNeedBy",
  CCShipWhenComplete: "CCShipWhenComplete",
  CCShippingPreference: "CCShippingPreference",
  CCReferLine: "CCReferLine",
  CCPoNumber: "CCPoNumber",
  BCToken: "BCToken",
  BCCustomer: "BCCustomer",
  CCAddresses: "CCAddresses",
  CCSelectShippingAddressId: "CCSelectShippingAddressId",
  BCCart: "BCCart",
  B3AuthToken: "B3AuthToken",
  BCGroupName: "BCGroupName",
  CCShipVia: "CCShipVia",
  CCShipViaOptions: "CCShipViaOptions",
  CCAllowOTS: "CCAllowOTS",
  CCOTSAddress: "CCOTSAddress",
  CCShippingMethod: "CCShippingMethod",
  CCSelectedAddress: "CCSelectedAddress"
}

const clear = () => {
  Object.values(CCStorageSchema).forEach(field => {
    sessionStorage.removeItem(field)
  })
}

const getValue = function (this: any) {
  return sessionStorage.getItem(this.name)
}

const setValue = function (this: any, value: string) {
  sessionStorage.setItem(this.name, value)
}

const removeValue = function (this: any) {
  sessionStorage.removeItem(this.name)
}

const mergeItemFunc = (obj: { name: string }) => ({
  ...obj,
  getValue: getValue.bind(obj),
  setValue: setValue.bind(obj),
  removeValue: removeValue.bind(obj),
})

const CCStorageFields = Object.entries(CCStorageSchema).reduce((result: any, [key, value]) => {
  result[key] = mergeItemFunc({
    name: value,
  })

  return result
}, {})

export default {
  clear,
  ...CCStorageFields,
}
