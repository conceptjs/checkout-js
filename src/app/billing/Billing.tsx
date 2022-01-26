import { Address, CheckoutRequestBody, CheckoutSelectors, Country, Customer, FormField } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';
import { TranslatedString } from '../locale';
import { getShippableItemsCount } from '../shipping';
import { Legend } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import getBillingMethodId from './getBillingMethodId';
import BillingForm, { BillingFormValues } from './BillingForm';

import { storage } from '../coldChainCheckout/utils';

export interface BillingProps {
    navigateNextStep(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
}

export interface WithCheckoutBillingProps {
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isInitializing: boolean;
    isUpdating: boolean;
    shouldShowOrderComments: boolean;
    billingAddress?: Address;
    methodId?: string;
    getFields(countryCode?: string): FormField[];
    initialize(): Promise<CheckoutSelectors>;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
}

interface BillingState {
    billingAddress?: Address;
}

class Billing extends Component<BillingProps & WithCheckoutBillingProps, BillingState> {
    constructor(props: BillingProps & WithCheckoutBillingProps) {
        super(props);

        var address = JSON.parse(storage.CCAddresses.getValue());

        this.state = {
            billingAddress: address.billAddresses
        };
    }

    async componentDidMount(): Promise<void> {
        const {
            initialize,
            onReady = noop,
            onUnhandledError,
        } = this.props;

        try {
            //var self = this;
            await initialize();


            var address = JSON.parse(storage.CCAddresses.getValue());

            if (address && this.props.customer) {
                this.props.customer.addresses = [address.billAddresses];
                //if (!this.props.billingAddress || this.props.billingAddress.customFields.length == 0) {
                //    setTimeout(function () {
                //        self.setState({
                //            billingAddress: address.addresses[address.defaultBillingId]
                //        })
                //    }, 1000);
                //}
            }

            try {
                await this.props.updateAddress(address.billAddresses);
            } catch (error) {
                onUnhandledError(error);
            }

            onReady();
        } catch (e) {
            onUnhandledError(e);
        }
    }

    /*
    async componentWillReceiveProps(nextProps: any): Promise<void> {
        if (!isEqualAddress(this.props.billingAddress, nextProps.shippingAddress)) {
            this.setState({
                billingAddress: nextProps.billingAddress
            })
        }
    }
    */

    render(): ReactNode {
        const {
            updateAddress,
            isInitializing,
            ...props
        } = this.props;

        const {
            billingAddress
        } = this.state;

        return (
            <div className="checkout-form">
                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>

                <LoadingOverlay
                    isLoading={isInitializing}
                    unmountContentWhenLoading
                >
                    <BillingForm
                        {...props}
                        onSubmit={this.handleSubmit}
                        updateAddress={updateAddress}
                        billingAddress={billingAddress}
                    />
                </LoadingOverlay>
            </div>
        );
    }

    private handleSubmit: (values: BillingFormValues) => void = async ({
        orderComment,
        ...addressValues
    }) => {
        const {
            updateAddress,
            updateCheckout,
            customerMessage,
            billingAddress,
            navigateNextStep,
            onUnhandledError,
        } = this.props;

        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        if (address && !isEqualAddress(address, billingAddress)) {
            promises.push(updateAddress(address));
        }

        if (customerMessage !== orderComment) {
            promises.push(updateCheckout({ customerMessage: orderComment }));
        }

        try {
            await Promise.all(promises);

            navigateNextStep();
        } catch (error) {
            onUnhandledError(error);
        }
    };
}

function mapToBillingProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutBillingProps | null {
    const {
        data: {
            getCheckout,
            getConfig,
            getCart,
            getCustomer,
            getBillingAddress,
            getBillingAddressFields,
            getBillingCountries,
        },
        statuses: {
            isLoadingBillingCountries,
            isUpdatingBillingAddress,
            isUpdatingCheckout,
        },
    } = checkoutState;

    const config = getConfig();
    const customer = getCustomer();
    const checkout = getCheckout();
    const cart = getCart();

    if (!config || !customer || !checkout || !cart) {
        return null;
    }

    const {
        enableOrderComments,
        googleMapsApiKey,
        features,
    } = config.checkoutSettings;

    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    return {
        billingAddress: getBillingAddress(),
        countries: getBillingCountries() || EMPTY_ARRAY,
        countriesWithAutocomplete,
        customer,
        customerMessage: checkout.customerMessage,
        getFields: getBillingAddressFields,
        googleMapsApiKey,
        initialize: checkoutService.loadBillingAddressFields,
        isInitializing: isLoadingBillingCountries(),
        isUpdating: isUpdatingBillingAddress() || isUpdatingCheckout(),
        methodId: getBillingMethodId(checkout),
        shouldShowOrderComments: enableOrderComments && getShippableItemsCount(cart) < 1,
        updateAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
    };
}

export default withCheckout(mapToBillingProps)(Billing);
