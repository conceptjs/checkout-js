import { LineItemMap, ShopperCurrency, StoreCurrency } from '@bigcommerce/checkout-sdk';
import React, { useMemo, FunctionComponent, ReactNode } from 'react';

import removeBundledItems from './removeBundledItems';
import OrderSummaryHeader from './OrderSummaryHeader';
import OrderSummaryItems from './OrderSummaryItems';
import OrderSummarySection from './OrderSummarySection';
import OrderSummarySubtotals, { OrderSummarySubtotalsProps } from './OrderSummarySubtotals';
import OrderSummaryTotal from './OrderSummaryTotal';

export interface OrderSummaryProps {
    lineItems: LineItemMap;
    total: number;
    headerLink: ReactNode;
    storeCurrency: StoreCurrency;
    shopperCurrency: ShopperCurrency;
    additionalLineItems?: ReactNode;
    isEUCompany?: boolean;
}

const OrderSummary: FunctionComponent<OrderSummaryProps & OrderSummarySubtotalsProps> = ({
    storeCurrency,
    shopperCurrency,
    headerLink,
    additionalLineItems,
    lineItems,
    total,
    isEUCompany,
    ...orderSummarySubtotalsProps
}) => {
    const nonBundledLineItems = useMemo(() => (
        removeBundledItems(lineItems)
    ), [lineItems]);

    //console.log("OrderSummary:isEUCompany:"+isEUCompany);

    return <article className="cart optimizedCheckout-orderSummary" data-test="cart">
        <OrderSummaryHeader>
            { headerLink }
        </OrderSummaryHeader>

        <OrderSummarySection>
            <OrderSummaryItems items={ nonBundledLineItems } />
        </OrderSummarySection>

        <OrderSummarySection>
            <OrderSummarySubtotals
                { ...orderSummarySubtotalsProps }
            />
            { additionalLineItems }
        </OrderSummarySection>

        <OrderSummarySection>
            <OrderSummaryTotal
                orderAmount={ total }
                shopperCurrencyCode={ shopperCurrency.code }
                storeCurrencyCode={ storeCurrency.code }
                isEUCompany={isEUCompany}
            />
        </OrderSummarySection>
    </article>;
};

export default OrderSummary;
