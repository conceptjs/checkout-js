import React, { useMemo, FC, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from "react-tooltip";

import { withDate, WithDateProps, TranslatedString } from '../../locale';
import { Fieldset, Legend, TextInput } from '../../ui/form';

import storage from '../utils/storage'
import OnlyShipWhenCompleteField from './OnlyShipWhenCompleteField'

import withLanguage, { WithLanguageProps } from '../../locale/withLanguage';

import { DropdownTrigger } from '../../ui/dropdown';
import { preventDefault } from '../../common/dom';

const ColdChainCOExtraFields: FC<WithDateProps & WithLanguageProps> = ({
    date,
    language
}) => {
    const shipViaOptions = JSON.parse(storage.CCShipViaOptions.getValue());

    const findShipViaByValue = (value: string) =>{
        return shipViaOptions.find((e:any) => e.value == value);
    }

    const [needBy, setNeedBy] = useState((storage.CCNeedBy.getValue()) ? new Date(storage.CCNeedBy.getValue()) : null);
    const [shipWhenComplete, setShipWhenComplete] = useState(storage.CCShipWhenComplete.getValue() || '');
    const [shippingReference, setShippingReference] = useState(storage.CCShippingPreference.getValue() || '');
    const [referLine, setReferLine] = useState(storage.CCReferLine.getValue() || '');
    const [shipVia, setShipVia] = useState(findShipViaByValue(storage.CCShipVia.getValue()) || { label: "", value: ""});

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

    const onSelectShipVia = (shipVia: any) => {
        setShipVia(shipVia);
        shipVia ? storage.CCShipVia.setValue(shipVia.value) : storage.CCShipVia.removeValue()
    }

    const needBylegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.needBy_label" />
            <FontAwesomeIcon data-for="main" data-tip={language.translate("shipping.needBy_help")} icon={faInfoCircle} className="cc-info-icon" />
        </Legend>
    ), []);

    const shippingPreferencelegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.shippingPreference_label" />
            <FontAwesomeIcon data-for="main" data-tip={language.translate("shipping.shippingPreference_help")} icon={faInfoCircle} className="cc-info-icon" />
        </Legend>
    ), []);

    const referLinelegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.referLine_label" />
            <FontAwesomeIcon data-for="main" data-tip={language.translate("shipping.referLine_help")} icon={faInfoCircle} className="cc-info-icon" />
        </Legend>
    ), []);

    const shipVialegend = useMemo(() => (
        <Legend>
            <TranslatedString id="shipping.shipVia_label" />
            <FontAwesomeIcon data-for="main" data-tip={language.translate("shipping.shipVia_help")} icon={faInfoCircle} className="cc-info-icon" />
        </Legend>
    ), []);

    return <div>
        <Fieldset legend={referLinelegend} testId="checkout-shipping-referLine">
            <TextInput
                name="referLine"
                autoComplete={'off'}
                maxLength={2000}
                onChange={handleReferLineInputChange}
                value={referLine}
            />
        </Fieldset>
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
            <p className="cc-needby-note"><TranslatedString id="shipping.needBy_note" /></p>
        </Fieldset>
        <Fieldset testId="checkout-shipping-onlyShipWhenComplete">
            <OnlyShipWhenCompleteField
                onChange={handleOnlyShipWhenCompleteInputChange}
                value={shipWhenComplete}
            />
        </Fieldset>
        <Fieldset
            id="checkout-shipping-via-options"
            legend={shipVialegend}
        >
            <div className="form-field">
                <div className="dropdown--select" role="combobox">
                    <DropdownTrigger
                        dropdown={
                            <ul
                                className="dropdown-menu instrumentSelect-dropdownMenu"
                                id="addressDropdown"
                            >
                                {shipViaOptions.map((sv:any) => (
                                    <li
                                        className="dropdown-menu-item dropdown-menu-item--select"
                                        key={sv.id}
                                    >
                                        <a href="#" onClick={preventDefault(() => onSelectShipVia(sv))}>
                                            <span>{sv.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        }
                    >
                        <a
                            className="button dropdown-button dropdown-toggle--select"
                            href="#"
                            id="shipViaToggle"
                            onClick={preventDefault()}
                        >
                            <span>{(shipVia)?shipVia.label:""}</span>
                        </a>
                    </DropdownTrigger>
                </div>
            </div>
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
        <ReactTooltip
            id="main"
            type="info"
            multiline={true}
        />
    </div>;
};

export default withLanguage(withDate(ColdChainCOExtraFields));
