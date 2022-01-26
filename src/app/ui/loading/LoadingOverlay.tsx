import React, { Fragment, FunctionComponent } from 'react';

import LoadingSpinner from './LoadingSpinner';
import { TranslatedString } from '../../locale';

export interface LoadingOverlayProps {
    isLoading: boolean;
    hideContentWhenLoading?: boolean;
    unmountContentWhenLoading?: boolean;
    creatingEpicorOrder?: boolean;
}

const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = ({
    children,
    hideContentWhenLoading,
    unmountContentWhenLoading,
    isLoading,
    creatingEpicorOrder
}) => {
    if (hideContentWhenLoading || unmountContentWhenLoading) {
        return (
            <Fragment>
                <LoadingSpinner isLoading={ isLoading } />
                {(creatingEpicorOrder)?<div className="cc-epicor-order-creation"><span className="label">
                    <TranslatedString id="common.create_epicor_order_text" />
                </span></div>:""}
                { unmountContentWhenLoading && isLoading ? null :
                    <div
                        style={ {
                            display: hideContentWhenLoading && isLoading ?
                                'none' :
                                undefined,
                        } }
                    >
                        { children }
                    </div> }
            </Fragment>
        );
    }

    return (
        <div className="loadingOverlay-container">
            { children }
            { isLoading && <div className="loadingOverlay optimizedCheckout-overlay" /> }
        </div>
    );
};

export default LoadingOverlay;
