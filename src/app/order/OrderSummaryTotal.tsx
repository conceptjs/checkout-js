import React, { Fragment, FunctionComponent } from 'react';

import { withCurrency, TranslatedString, WithCurrencyProps } from '../locale';

import OrderSummaryPrice from './OrderSummaryPrice';

export interface OrderSummaryTotalProps {
    orderAmount: number;
    shopperCurrencyCode: string;
    storeCurrencyCode: string;
    isEUCompany?: boolean;
}

const OrderSummaryTotal: FunctionComponent<OrderSummaryTotalProps & WithCurrencyProps> = ({
    shopperCurrencyCode,
    storeCurrencyCode,
    orderAmount,
    currency,
    isEUCompany
}) => {

    const hasDifferentCurrency = shopperCurrencyCode !== storeCurrencyCode;
    const label = <Fragment>
        { hasDifferentCurrency ?
            <TranslatedString id="cart.estimated_total_text" /> :
            <TranslatedString id="cart.total_text" /> }
        { ` (${shopperCurrencyCode})` }
    </Fragment>;

    //console.log("OrderSummaryTotal:isEUCompany:"+isEUCompany);

    return (
        <Fragment>
            <OrderSummaryPrice
                amount={ orderAmount }
                className="cart-priceItem--total"
                label={ label }
                superscript={ hasDifferentCurrency ? '*' : undefined }
                testId="cart-total"
                isEUCompany={isEUCompany}
            />
            { hasDifferentCurrency && currency && <p
                className="cart-priceItem--totalNote"
                data-test="cart-price-item-total-note"
            >
                <TranslatedString
                    data={ {
                        total: currency.toStoreCurrency(orderAmount),
                        code: storeCurrencyCode,
                    } }
                    id="cart.billed_amount_text"
                />
            </p> }
        </Fragment>
    );
};

export default withCurrency(OrderSummaryTotal);
