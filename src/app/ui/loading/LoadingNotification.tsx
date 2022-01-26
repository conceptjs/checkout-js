import React, { memo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';

export interface LoadingNotificationProps {
    isLoading: boolean;
    creatingEpicorOrder: boolean;
}

const LoadingNotification: FunctionComponent<LoadingNotificationProps> = ({
    isLoading,
    creatingEpicorOrder
}) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div className="loadingNotification">
            <div className="loadingNotification-label optimizedCheckout-loadingToaster">
                <div className="spinner" />

                <span className="label">
                    <TranslatedString id={(creatingEpicorOrder)?"common.create_epicor_order_text":"common.loading_text"} />
                </span>
            </div>
        </div>
    );
};

export default memo(LoadingNotification);
