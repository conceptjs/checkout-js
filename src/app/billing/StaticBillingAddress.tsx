import { Address, CheckoutPayment, FormField, CheckoutSelectors } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent } from 'react';

import { AddressType, StaticAddress } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';
import { TranslatedString } from '../locale';

export interface StaticBillingAddressProps {
    address: Address;
}

interface WithCheckoutStaticBillingAddressProps {
    fields: FormField[];
    payments?: CheckoutPayment[];
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

const StaticBillingAddress: FunctionComponent<
    StaticBillingAddressProps &
    WithCheckoutStaticBillingAddressProps
> = ({
    address,
    payments = EMPTY_ARRAY,
    //updateAddress
}) => {
    /*
        useEffect(() => {
            updateAddress(address);
        },[address])
        */

        if (payments.find(payment => payment.providerId === 'amazon')) {
            return (
                <p><TranslatedString id="billing.billing_address_amazon" /></p>
            );
        }

        if (payments.find(payment => payment.providerId === 'amazonpay')) {
            return (
                <p><TranslatedString id="billing.billing_address_amazonpay" /></p>
            );
        }

        return (
            <StaticAddress
                address={address}
                type={AddressType.Billing}
            />
        );
    };

export function mapToStaticBillingAddressProps(
    { checkoutState, checkoutService }: CheckoutContextProps,
    { address }: StaticBillingAddressProps
): WithCheckoutStaticBillingAddressProps | null {
    const {
        data: {
            getBillingAddressFields,
            getCheckout,
        },
    } = checkoutState;

    const checkout = getCheckout();

    return {
        fields: getBillingAddressFields(address.countryCode),
        payments: checkout && checkout.payments,
        updateAddress: checkoutService.updateBillingAddress,
    };
}

export default withCheckout(mapToStaticBillingAddressProps)(memo(StaticBillingAddress));
