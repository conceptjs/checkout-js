import React, { ComponentType, FunctionComponent } from 'react';

import { OrderSummaryProps, OrderSummarySubtotalsProps } from '../order';

import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
import { WithCheckoutCartSummaryProps, CartSummaryProps } from './CartSummary';
import Redeemable from './Redeemable';

export default function withRedeemable(
    OriginalComponent: ComponentType<OrderSummaryProps & OrderSummarySubtotalsProps>
): FunctionComponent<
    WithCheckoutCartSummaryProps & CartSummaryProps &
    { headerLink?: any }
> {
    return props => {
        const {
            checkout,
            storeCurrency,
            shopperCurrency,
            headerLink,
            onRemovedCoupon,
            onRemovedGiftCertificate,
            storeCreditAmount,
            isEUCompany,
            ...redeemableProps
        } = props;

        //console.log("withRedeemable:isEUCompany:"+isEUCompany);

        return (
            <OriginalComponent
                { ...mapToOrderSummarySubtotalsProps(checkout) }
                additionalLineItems={
                    <Redeemable { ...{
                        ...redeemableProps,
                        onRemovedCoupon,
                        onRemovedGiftCertificate,
                    } }
                    />
                }
                headerLink={ headerLink }
                lineItems={ checkout.cart.lineItems }
                onRemovedCoupon={ onRemovedCoupon }
                onRemovedGiftCertificate={ onRemovedGiftCertificate }
                shopperCurrency={ shopperCurrency }
                storeCreditAmount={ storeCreditAmount }
                storeCurrency={ storeCurrency }
                total={ checkout.outstandingBalance }
                isEUCompany={isEUCompany}
            />
        );
    };
}
