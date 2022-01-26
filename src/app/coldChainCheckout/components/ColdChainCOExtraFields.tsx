import React, { useMemo, FC, useState } from 'react';
import ReactDatePicker from 'react-datepicker';

import { withDate, WithDateProps, TranslatedString} from '../../locale';
import { Fieldset, Legend, TextInput } from '../../ui/form';

import storage from '../utils/storage'
import OnlyShipWhenCompleteField from './OnlyShipWhenCompleteField'

import withLanguage, { WithLanguageProps } from '../../locale/withLanguage';

const ColdChainCOExtraFields: FC<WithDateProps & WithLanguageProps> = ({
    date,
    language
}) => {
    const [needBy, setNeedBy] = useState((storage.CCNeedBy.getValue())?new Date(storage.CCNeedBy.getValue()):null);
    const [shipWhenComplete, setShipWhenComplete] = useState(storage.CCShipWhenComplete.getValue() || '');
    const [shippingReference, setShippingReference] = useState(storage.CCShippingPreference.getValue() || '');
    const [referLine, setReferLine] = useState(storage.CCReferLine.getValue() || '');

    /*
    const renderOnlyShipWhenCompleteLabel = useMemo(() => (
        <TranslatedString id="shipping.onlyShipWhenComplete_label" />
    ), []);
    */

    const handleNeedByInputChange = (date: Date) => {
        setNeedBy(date);
        date ? storage.CCNeedBy.setValue(date.toString()) : storage.CCNeedBy.removeValue()
    }

    const handleOnlyShipWhenCompleteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShipWhenComplete((e.target.checked) ? "Y" : "N");
        storage.CCShipWhenComplete.setValue((e.target.checked) ? "Y" : "N");
    }

    const handleShippingPreferenceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setShippingReference(val)
        val ? storage.CCShippingPreference.setValue(val) : storage.CCShippingPreference.removeValue()
    }

    const handleReferLineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setReferLine(val)
        val ? storage.CCReferLine.setValue(val) : storage.CCReferLine.removeValue()
    }

    const needBylegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.needBy_label" />
        </Legend>
    ), []);

    const shippingPreferencelegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.shippingPreference_label" />
        </Legend>
    ), []);

    const referLinelegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.referLine_label" />
        </Legend>
    ), []);

    return <div>
        <Fieldset legend={needBylegend} testId="checkout-shipping-needBy">
            <ReactDatePicker
                autoComplete="off"
                calendarClassName="optimizedCheckout-contentPrimary"
                className="form-input optimizedCheckout-form-input"
                dateFormat={date.inputFormat}
                name="needBy"
                onChange={handleNeedByInputChange}
                placeholderText={language.translate("shipping.needByPlaceHolder_label")}
                popperClassName="optimizedCheckout-contentPrimary"
                selected={needBy}
            />
        </Fieldset>
        <Fieldset testId="checkout-shipping-onlyShipWhenComplete">
            <OnlyShipWhenCompleteField 
                onChange={handleOnlyShipWhenCompleteInputChange}
                value={shipWhenComplete}
            />
        </Fieldset>
        <Fieldset legend={shippingPreferencelegend} testId="checkout-shipping-shippingPreference">
            <TextInput
                name="shippingPreference"
                autoComplete={'off'}
                maxLength={2000}
                onChange={handleShippingPreferenceInputChange}
                value={shippingReference}
            />
        </Fieldset>
        <Fieldset legend={referLinelegend} testId="checkout-shipping-referLine">
            <TextInput
                name="referLine"
                autoComplete={'off'}
                maxLength={2000}
                onChange={handleReferLineInputChange}
                value={referLine}
            />
        </Fieldset>
    </div>;
};

export default withLanguage(withDate(ColdChainCOExtraFields));
