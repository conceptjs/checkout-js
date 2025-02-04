import { Address, Cart, CartChangedError, CheckoutParams, CheckoutSelectors, CheckoutService, Consignment, EmbeddedCheckoutMessenger, EmbeddedCheckoutMessengerOptions, FlashMessage, Promotion, RequestOptions, StepTracker } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import { find, findIndex } from 'lodash';
import React, { lazy, Component, ReactNode } from 'react';

import CCCheckout from '../coldChainCheckout';
import { StaticBillingAddress } from '../billing';
import { EmptyCartMessage } from '../cart';
import { isCustomError, CustomError, ErrorLogger, ErrorModal } from '../common/error';
import { retry } from '../common/utility';
import { CheckoutSuggestion, CustomerInfo, CustomerSignOutEvent, CustomerViewType } from '../customer';
import { isEmbedded, EmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { PromotionBannerList } from '../promotion';
import { hasSelectedShippingOptions, isUsingMultiShipping, StaticConsignment } from '../shipping';
import { ShippingOptionExpiredError } from '../shipping/shippingOption';
import { LazyContainer, LoadingNotification, LoadingOverlay } from '../ui/loading';
import { MobileView } from '../ui/responsive';

import mapToCheckoutProps from './mapToCheckoutProps';
import navigateToOrderConfirmation from './navigateToOrderConfirmation';
import withCheckout from './withCheckout';
import CheckoutStep from './CheckoutStep';
import CheckoutStepStatus from './CheckoutStepStatus';
import CheckoutStepType from './CheckoutStepType';
import CheckoutSupport from './CheckoutSupport';
import isEqualAddress from '../address/isEqualAddress';

var _ = require('underscore');

import ccService from '../coldChainCheckout/request';
import { storage } from '../coldChainCheckout/utils';
import { util } from '../coldChainCheckout/utils';

const Billing = lazy(() => retry(() => import(
    /* webpackChunkName: "billing" */
    '../billing/Billing'
)));

const CartSummary = lazy(() => retry(() => import(
    /* webpackChunkName: "cart-summary" */
    '../cart/CartSummary'
)));

const CartSummaryDrawer = lazy(() => retry(() => import(
    /* webpackChunkName: "cart-summary-drawer" */
    '../cart/CartSummaryDrawer'
)));

const Customer = lazy(() => retry(() => import(
    /* webpackChunkName: "customer" */
    '../customer/Customer'
)));

const Payment = lazy(() => retry(() => import(
    /* webpackChunkName: "payment" */
    '../payment/Payment'
)));

const Shipping = lazy(() => retry(() => import(
    /* webpackChunkName: "shipping" */
    '../shipping/Shipping'
)));

export interface CheckoutProps {
    checkoutId: string;
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    embeddedSupport: CheckoutSupport;
    errorLogger: ErrorLogger;
    createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
    createStepTracker(): StepTracker;
}

export interface CheckoutState {
    activeStepType?: CheckoutStepType;
    isBillingSameAsShipping: boolean;
    customerViewType?: CustomerViewType;
    defaultStepType?: CheckoutStepType;
    error?: Error;
    flashMessages?: FlashMessage[];
    isMultiShippingMode: boolean;
    isCartEmpty: boolean;
    isRedirecting: boolean;
    hasSelectedShippingOptions: boolean;
    creatingEpicorOrder: boolean;
    isEUCompany: boolean;
}

export interface WithCheckoutProps {
    billingAddress?: Address;
    cart?: Cart;
    consignments?: Consignment[];
    error?: Error;
    hasCartChanged: boolean;
    flashMessages?: FlashMessage[];
    isGuestEnabled: boolean;
    isLoadingCheckout: boolean;
    isPending: boolean;
    loginUrl: string;
    createAccountUrl: string;
    canCreateAccountInCheckout: boolean;
    promotions?: Promotion[];
    steps: CheckoutStepStatus[];
    clearError(error?: Error): void;
    loadCheckout(id: string, options?: RequestOptions<CheckoutParams>): Promise<CheckoutSelectors>;
    subscribeToConsignments(subscriber: (state: CheckoutSelectors) => void): () => void;
    checkoutService: CheckoutService;
}

class Checkout extends Component<CheckoutProps & WithCheckoutProps & WithLanguageProps, CheckoutState> {
    stepTracker: StepTracker | undefined;

    state: CheckoutState = {
        isBillingSameAsShipping: true,
        isCartEmpty: false,
        isRedirecting: false,
        isMultiShippingMode: false,
        hasSelectedShippingOptions: false,
        creatingEpicorOrder: false,
        isEUCompany: false
    };

    private embeddedMessenger?: EmbeddedCheckoutMessenger;
    private unsubscribeFromConsignments?: () => void;

    componentWillUnmount(): void {
        if (this.unsubscribeFromConsignments) {
            this.unsubscribeFromConsignments();
            this.unsubscribeFromConsignments = undefined;
        }
    }

    async componentDidMount(): Promise<void> {
        const {
            checkoutId,
            containerId,
            createStepTracker,
            createEmbeddedMessenger,
            embeddedStylesheet,
            loadCheckout,
            subscribeToConsignments,
            checkoutService
        } = this.props;

        try {
            const { data } = await loadCheckout(checkoutId, {
                params: {
                    include: [
                        'cart.lineItems.physicalItems.categoryNames',
                        'cart.lineItems.digitalItems.categoryNames',
                    ] as any, // FIXME: Currently the enum is not exported so it can't be used here.
                },
            });

            await CCCheckout.customer.init(data, checkoutService);
            var address = await ccService.api.getShippingAddress();
            storage.CCAddresses.setValue(JSON.stringify(address));
            storage.BCGroupName.setValue(address.groupName);
            storage.CCAllowOTS.setValue(""+address.AllowOTS);
            storage.CCShipViaOptions.setValue(JSON.stringify(address.shipVias));
            this.setState({isEUCompany: (address.groupName)?address.groupName.startsWith("E"):false});

            address.billAddresses.country_code = util.getCountryISOCodeFromName(address.billAddresses.country);
            await checkoutService.updateBillingAddress(address.billAddresses);

            const { links: { siteLink = '' } = {} } = data.getConfig() || {};
            const errorFlashMessages = data.getFlashMessages('error') || [];

            if (errorFlashMessages.length) {
                const { language } = this.props;

                this.setState({
                    error: new CustomError({
                        title: errorFlashMessages[0].title || language.translate('common.error_heading'),
                        message: errorFlashMessages[0].message,
                        data: {},
                        name: 'default',
                    }),
                });
            }

            const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

            this.unsubscribeFromConsignments = subscribeToConsignments(this.handleConsignmentsUpdated);
            this.embeddedMessenger = messenger;
            messenger.receiveStyles(styles => embeddedStylesheet.append(styles));
            messenger.postFrameLoaded({ contentId: containerId });
            messenger.postLoaded();

            this.stepTracker = createStepTracker();
            this.stepTracker.trackCheckoutStarted();

            const consignments = data.getConsignments();

            
            if (consignments && consignments.length > 0 && consignments[0].shippingAddress &&
                consignments[0].shippingAddress.customFields.length > 0) {
                    checkoutService.updateShippingAddress(consignments[0].shippingAddress);
                /*
                var selectedShippingAddress = _.find(_.values(address.addresses), function(a:any){
                    return isEqualAddress(consignments[0].shippingAddress, a);
                })

                if (!selectedShippingAddress){
                    consignments[0].shippingAddress = address.addresses[address.defaultShippingId];
                }
                
                storage.CCSelectShippingAddressId.setValue(consignments[0].shippingAddress.customFields[0].fieldValue);
                */
            }
            

            if (this.props.steps.length == 4 && this.props.steps[2].isActive) {
                this.props.steps[2].isActive = false;
                this.props.steps[2].isComplete = true;
                this.props.steps[3].isActive = true;
                this.stepTracker.trackStepCompleted("billing");
            }

            const cart = data.getCart();
            const hasMultiShippingEnabled = data.getConfig()?.checkoutSettings?.hasMultiShippingEnabled;
            const isMultiShippingMode = !!cart &&
                !!consignments &&
                hasMultiShippingEnabled &&
                isUsingMultiShipping(consignments, cart.lineItems);

            if (isMultiShippingMode) {
                this.setState({ isMultiShippingMode }, this.handleReady);
            } else {
                this.handleReady();
            }
        } catch (error) {
            this.handleUnhandledError(error);
        }
    }

    render(): ReactNode {
        const { error } = this.state;
        let errorModal = null;

        if (error) {
            if (isCustomError(error)) {
                errorModal = <ErrorModal error={error} onClose={this.handleCloseErrorModal} title={error.title} />;
            } else {
                errorModal = <ErrorModal error={error} onClose={this.handleCloseErrorModal} />;
            }
        }

        return <>
            <div className={classNames({ 'is-embedded': isEmbedded() })}>
                <div className="layout optimizedCheckout-contentPrimary">
                    {this.renderContent()}
                </div>
                {errorModal}
            </div>

        </>;
    }

    private renderContent(): ReactNode {
        const {
            isPending,
            loginUrl,
            promotions = [],
            steps,
        } = this.props;

        const {
            activeStepType,
            defaultStepType,
            isCartEmpty,
            isRedirecting,
            creatingEpicorOrder,
            isEUCompany
        } = this.state;

        if (isCartEmpty) {
            return (
                <EmptyCartMessage
                    loginUrl={loginUrl}
                    waitInterval={3000}
                />
            );
        }

        return (
            <div className="cc-overlay-wrapper">
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={isRedirecting}
                creatingEpicorOrder={creatingEpicorOrder}
            >
                <div className="layout-main">
                    <LoadingNotification isLoading={isPending || isRedirecting} creatingEpicorOrder={creatingEpicorOrder}/>

                    <PromotionBannerList promotions={promotions} />

                    <ol className="checkout-steps">
                        {steps
                            .filter(step => step.isRequired)
                            .map(step => this.renderStep({
                                ...step,
                                isActive: (activeStepType ? activeStepType === step.type : defaultStepType === step.type),
                            }))}
                    </ol>
                </div>

                { this.renderCartSummary(isEUCompany)}
            </LoadingOverlay>
            </div>
        );
    }

    private renderStep(step: CheckoutStepStatus): ReactNode {
        switch (step.type) {
            case CheckoutStepType.Customer:
                return this.renderCustomerStep(step);

            case CheckoutStepType.Shipping:
                return this.renderShippingStep(step);

            case CheckoutStepType.Billing:
                return this.renderBillingStep(step);

            case CheckoutStepType.Payment:
                return this.renderPaymentStep(step);

            default:
                return null;
        }
    }

    private renderCustomerStep(step: CheckoutStepStatus): ReactNode {
        const { isGuestEnabled } = this.props;

        const {
            customerViewType = isGuestEnabled ? CustomerViewType.Guest : CustomerViewType.Login,
        } = this.state;

        return (
            <CheckoutStep
                {...step}
                heading={<TranslatedString id="customer.customer_heading" />}
                key={step.type}
                onEdit={this.handleEditStep}
                onExpanded={this.handleExpanded}
                suggestion={<CheckoutSuggestion />}
                summary={
                    <CustomerInfo
                        onSignOut={this.handleSignOut}
                        onSignOutError={this.handleError}
                    />
                }
            >
                <LazyContainer>
                    <Customer
                        checkEmbeddedSupport={this.checkEmbeddedSupport}
                        isEmbedded={isEmbedded()}
                        onAccountCreated={this.navigateToNextIncompleteStep}
                        onChangeViewType={this.setCustomerViewType}
                        onContinueAsGuest={this.navigateToNextIncompleteStep}
                        onContinueAsGuestError={this.handleError}
                        onReady={this.handleReady}
                        onSignIn={this.navigateToNextIncompleteStep}
                        onSignInError={this.handleError}
                        onUnhandledError={this.handleUnhandledError}
                        viewType={customerViewType}
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderShippingStep(step: CheckoutStepStatus): ReactNode {
        const {
            hasCartChanged,
            cart,
            consignments = [],
        } = this.props;

        const {
            isBillingSameAsShipping,
            isMultiShippingMode,
        } = this.state;

        if (!cart) {
            return;
        }

        if (storage.CCAddresses.getValue() && consignments && consignments.length > 0 && consignments[0].shippingAddress &&
        consignments[0].shippingAddress.customFields && consignments[0].shippingAddress.customFields.length > 0) {
            var address = JSON.parse(storage.CCAddresses.getValue());
            var selectedShippingAddress = _.find(_.values(address.addresses), function(a:any){
                return isEqualAddress(consignments[0].shippingAddress, a);
            })

            if (!selectedShippingAddress && address.defaultShippingId){
                consignments[0].shippingAddress = address.addresses[address.defaultShippingId];
            }
            
            if (consignments[0].shippingAddress){
                storage.CCSelectShippingAddressId.setValue(consignments[0].shippingAddress.customFields[0].fieldValue);
            }

            storage.CCShippingMethod.setValue("buildIn");

            //if (consignments[0].selectedShippingOption){
            //    consignments[0].selectedShippingOption.description = "Any applicable freight charges may be added";
            //}
        }else if (consignments && consignments.length > 0 && consignments[0].shippingAddress &&
            consignments[0].shippingAddress.customFields && consignments[0].shippingAddress.customFields.length == 0){
            storage.CCShippingMethod.setValue("OTS");
            storage.CCOTSAddress.setValue(JSON.stringify(consignments[0].shippingAddress));
        }

        return (
            <CheckoutStep
                {...step}
                heading={<TranslatedString id="shipping.shipping_heading" />}
                key={step.type}
                onEdit={this.handleEditStep}
                onExpanded={this.handleExpanded}
                summary={consignments.map(consignment =>
                    <div className="staticConsignmentContainer" key={consignment.id}>
                        <StaticConsignment
                            cart={cart}
                            compactView={consignments.length < 2}
                            consignment={consignment}
                            shippingAddress={consignment.shippingAddress}
                        />
                    </div>)}
            >
                <LazyContainer>
                    <Shipping
                        cartHasChanged={hasCartChanged}
                        isBillingSameAsShipping={isBillingSameAsShipping}
                        isMultiShippingMode={isMultiShippingMode}
                        navigateNextStep={this.handleShippingNextStep}
                        onCreateAccount={this.handleShippingCreateAccount}
                        onReady={this.handleReady}
                        onSignIn={this.handleShippingSignIn}
                        onToggleMultiShipping={this.handleToggleMultiShipping}
                        onUnhandledError={this.handleUnhandledError}
                        shippingAddress={(consignments && consignments.length > 0)?consignments[0].shippingAddress:null}
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderBillingStep(step: CheckoutStepStatus): ReactNode {
        //const { billingAddress } = this.props;

        var address = JSON.parse(storage.CCAddresses.getValue());
        if (address){
            var billingAddress = address.billAddresses;
        }

        return (
            <CheckoutStep
                {...step}
                heading={<TranslatedString id="billing.billing_heading" />}
                key={step.type}
                onEdit={this.handleEditStep}
                onExpanded={this.handleExpanded}
                summary={billingAddress && <StaticBillingAddress address={billingAddress} />}
                isEditable={false}
            >
                <LazyContainer>
                    <Billing
                        navigateNextStep={this.navigateToNextIncompleteStep}
                        onReady={this.handleReady}
                        onUnhandledError={this.handleUnhandledError}
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderPaymentStep(step: CheckoutStepStatus): ReactNode {
        const {
            consignments,
            cart,
        } = this.props;

        return (
            <CheckoutStep
                {...step}
                heading={<TranslatedString id="payment.payment_heading" />}
                key={step.type}
                onEdit={this.handleEditStep}
                onExpanded={this.handleExpanded}
            >
                <LazyContainer>
                    <Payment
                        checkEmbeddedSupport={this.checkEmbeddedSupport}
                        isEmbedded={isEmbedded()}
                        isUsingMultiShipping={cart && consignments ? isUsingMultiShipping(consignments, cart.lineItems) : false}
                        onCartChangedError={this.handleCartChangedError}
                        onFinalize={this.navigateToOrderConfirmation}
                        onReady={this.handleReady}
                        onSubmit={this.navigateToOrderConfirmation}
                        onSubmitError={this.handleError}
                        onUnhandledError={this.handleUnhandledError}
                        onCreatingEpicorOrder={this.setCreatingEpicorOrder}
                    />
                </LazyContainer>
            </CheckoutStep>
        );
    }

    private renderCartSummary(isEUCompany:boolean): ReactNode {
        //console.log("renderCartSummary:isEUCompany:"+isEUCompany);
        return (
            <MobileView>
                { matched => {
                    if (matched) {
                        return <LazyContainer>
                            <CartSummaryDrawer />
                        </LazyContainer>;
                    }

                    return <aside className="layout-cart">
                        <LazyContainer>
                            <CartSummary isEUCompany={isEUCompany}/>
                        </LazyContainer>
                    </aside>;
                }}
            </MobileView>
        );
    }

    private navigateToStep(type: CheckoutStepType, options?: { isDefault?: boolean }): void {
        const { clearError, error, steps } = this.props;
        const { activeStepType } = this.state;
        const step = find(steps, { type });

        if (!step) {
            return;
        }

        if (activeStepType === step.type) {
            return;
        }

        if (options && options.isDefault) {
            this.setState({ defaultStepType: step.type });
        } else {
            this.setState({ activeStepType: step.type });
        }

        if (error) {
            clearError(error);
        }
    }

    private handleToggleMultiShipping: () => void = () => {
        const { isMultiShippingMode } = this.state;

        this.setState({ isMultiShippingMode: !isMultiShippingMode });
    };

    private setCreatingEpicorOrder: (flag:boolean) => void = flag => {
        this.setState({ creatingEpicorOrder: flag, isRedirecting: flag  });
    };

    private navigateToNextIncompleteStep: (options?: { isDefault?: boolean }) => void = options => {
        const { steps } = this.props;
        const activeStepIndex = findIndex(steps, { isActive: true });
        const activeStep = activeStepIndex >= 0 && steps[activeStepIndex];

        if (!activeStep) {
            return;
        }

        const previousStep = steps[Math.max(activeStepIndex - 1, 0)];

        if (previousStep && this.stepTracker) {
            this.stepTracker.trackStepCompleted(previousStep.type);
        }

        this.navigateToStep(activeStep.type, options);

    };

    private navigateToOrderConfirmation: () => void = () => {
        const { steps } = this.props;

        if (this.stepTracker) {
            this.stepTracker.trackStepCompleted(steps[steps.length - 1].type);
        }

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postComplete();
        }

        this.setState({ isRedirecting: true }, () => {
            navigateToOrderConfirmation();
        });
    };

    private checkEmbeddedSupport: (methodIds: string[]) => boolean = methodIds => {
        const { embeddedSupport } = this.props;

        return embeddedSupport.isSupported(...methodIds);
    };

    private handleCartChangedError: (error: CartChangedError) => void = () => {
        this.navigateToStep(CheckoutStepType.Shipping);
    };

    private handleConsignmentsUpdated: (state: CheckoutSelectors) => void = ({ data }) => {
        const {
            hasSelectedShippingOptions: prevHasSelectedShippingOptions,
            activeStepType,
        } = this.state;

        const { steps } = this.props;

        const newHasSelectedShippingOptions = hasSelectedShippingOptions(data.getConsignments() || []);

        if (prevHasSelectedShippingOptions &&
            !newHasSelectedShippingOptions &&
            findIndex(steps, { type: CheckoutStepType.Shipping }) < findIndex(steps, { type: activeStepType })
        ) {
            this.navigateToStep(CheckoutStepType.Shipping);
            this.setState({ error: new ShippingOptionExpiredError() });
        }

        this.setState({ hasSelectedShippingOptions: newHasSelectedShippingOptions });
    };

    private handleCloseErrorModal: () => void = () => {
        this.setState({ error: undefined });
    };

    private handleExpanded: (type: CheckoutStepType) => void = type => {
        if (this.stepTracker) {
            this.stepTracker.trackStepViewed(type);
        }
    };

    private handleUnhandledError: (error: Error) => void = error => {
        this.handleError(error);

        // For errors that are not caught and handled by child components, we
        // handle them here by displaying a generic error modal to the shopper.
        this.setState({ error });
    };

    private handleError: (error: Error) => void = error => {
        const { errorLogger } = this.props;

        errorLogger.log(error);

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postError(error);
        }
    };

    private handleEditStep: (type: CheckoutStepType) => void = type => {
        this.navigateToStep(type);
    };

    private handleReady: () => void = () => {
        this.navigateToNextIncompleteStep({ isDefault: true });
    };

    private handleSignOut: (event: CustomerSignOutEvent) => void = ({ isCartEmpty }) => {
        const { loginUrl, isGuestEnabled } = this.props;

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postSignedOut();
        }

        if (isGuestEnabled) {
            this.setCustomerViewType(CustomerViewType.Guest);
        }

        if (isCartEmpty) {
            this.setState({ isCartEmpty: true });

            if (!isEmbedded()) {
                return window.top.location.assign(loginUrl);
            }
        }

        this.navigateToStep(CheckoutStepType.Customer);

        CCCheckout.customer.logout();
    };

    private handleShippingNextStep: (isBillingSameAsShipping: boolean) => void = isBillingSameAsShipping => {
        this.setState({ isBillingSameAsShipping });

        this.props.steps[2].isActive = false;
        this.props.steps[2].isComplete = true;
        this.props.steps[3].isActive = true;
        if (this.stepTracker) {
            this.stepTracker.trackStepCompleted("billing");
        }

        //if (isBillingSameAsShipping) {
        if (!this.props.steps[1].isComplete){
            this.handleUnhandledError(new Error("Invalid Shipping Address, please double check!"));
        }else{
            this.navigateToNextIncompleteStep();
        }
        //} else {
        //this.navigateToStep(CheckoutStepType.Payment);
        //}
    };

    private handleShippingSignIn: () => void = () => {
        this.setCustomerViewType(CustomerViewType.Login);
    };

    private handleShippingCreateAccount: () => void = () => {
        this.setCustomerViewType(CustomerViewType.CreateAccount);
    };

    private setCustomerViewType: (viewType: CustomerViewType) => void = customerViewType => {
        const {
            canCreateAccountInCheckout,
            createAccountUrl,
        } = this.props;

        if (customerViewType === CustomerViewType.CreateAccount &&
            (!canCreateAccountInCheckout || isEmbedded())
        ) {
            window.top.location.replace(createAccountUrl);

            return;
        }

        this.navigateToStep(CheckoutStepType.Customer);
        this.setState({ customerViewType });
    };
}

export default withLanguage(withCheckout(mapToCheckoutProps)(Checkout));
