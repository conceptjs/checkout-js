import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent, PureComponent, ReactNode, useState } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { DropdownTrigger } from '../ui/dropdown';
import RadioInput from '../ui/form/RadioInput';
import { Fieldset, Form, Label, TextInput } from '../ui/form';

import isEqualAddress from './isEqualAddress';
import './AddressSelect.scss';
import StaticAddress from './StaticAddress';

import { AddressFilterInput } from '../coldChainCheckout';

import { storage } from '../coldChainCheckout/utils';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

interface AddressSelectState {
    shippingAddressMethod: string;
    OTSAddress: any;
}

const addrBase = {
    address1: "",
    address2: "",
    city: "",
    company: "",
    country: "USA",
    countryCode: "US",
    customFields: [],
    firstName: "",
    id: "",
    lastName: "",
    phone: "",
    postalCode: "",
    stateOrProvince: "",
    stateOrProvinceCode: "",    
    type: "residential"
}

class AddressSelect extends PureComponent<AddressSelectProps> {
    state: AddressSelectState = {
        shippingAddressMethod: (storage.CCShippingMethod.getValue())?storage.CCShippingMethod.getValue():"buildIn",
        OTSAddress: (storage.CCOTSAddress.getValue()) ? JSON.parse(storage.CCOTSAddress.getValue()) : addrBase
    };

    handleShippingAddressMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        storage.CCShippingMethod.setValue(e.target.value);
        this.setState({ shippingAddressMethod: e.target.value });
        console.log("after set, storage.CCShippingMethod value:"+storage.CCShippingMethod.getValue());
    }

    render(): ReactNode {
        const {
            addresses,
            selectedAddress,
        } = this.props;

        const {
            shippingAddressMethod,
            OTSAddress
        } = this.state;

        const formFields = [
            { id: "firstName", name: "firstName", custom: false, label: "Contact Name", required: true },
            { id: "company", name: "company", custom: false, label: "Company Name", required: true },
            { id: "address1", name: "address1", custom: false, label: "Address Line 1", required: true },
            { id: "address2", name: "address2", custom: false, label: "Address Line 2", required: false },
            { id: "city", name: "city", custom: false, label: "City", required: true },
            { id: "stateOrProvince", name: "stateOrProvince", custom: false, label: "State", required: true },
            { id: "postalCode", name: "postalCode", custom: false, label: "Zip Code", required: true },
            { id: "phone", name: "phone", custom: false, label: "Phone Number", required: false }
        ]

        const allowOTS = storage.CCAllowOTS.getValue();
        console.log("allowOTS:" + allowOTS);
        var isOTSAddress = (selectedAddress && selectedAddress.customFields && selectedAddress.customFields.length == 0);

        return (
            <div className="form-field">
                <RadioInput
                    checked={shippingAddressMethod == "buildIn"}
                    id="addr-methohd-default"
                    key="buildIn"
                    label="Choose from the address book:"
                    name="shippingAddressMethod"
                    onChange={this.handleShippingAddressMethodChange}
                    value="buildIn"
                />
                {(shippingAddressMethod == "buildIn") ?<div className="dropdown--select" role="combobox">
                    <DropdownTrigger
                        dropdown={
                            <AddressSelectMenu
                                addresses={addresses}
                                onSelectAddress={this.handleSelectAddress}
                                onUseNewAddress={this.handleUseNewAddress}
                                selectedAddress={(isOTSAddress)?undefined:selectedAddress}
                            />
                        }
                    >
                        <AddressSelectButton
                            addresses={addresses}
                            selectedAddress={selectedAddress}
                        />
                    </DropdownTrigger>
                </div>:""}
                {(allowOTS == "true") ? <RadioInput
                    checked={shippingAddressMethod == "OTS"}
                    id="addr-method-ots"
                    key="OTS"
                    label="Specify a one-time shipping address (US only):"
                    name="shippingAddressMethod"
                    onChange={this.handleShippingAddressMethodChange}
                    value="OTS"
                /> : ""}
                {(allowOTS == "true" && shippingAddressMethod == "OTS") ? <Form
                    className="checkout-form"
                    id="checkout-customer-returning"
                    testId="checkout-customer-returning"
                >
                    <Fieldset>
                        <div className="create-account-form">
                            {formFields.map(field => (
                                <div className="dynamic-form-field">
                                    <div className="form-field">
                                        <Label htmlFor={field.id}>
                                            {field.label}
                                            {(field.required)? <>
                                                    {' '}
                                                    <small className="optimizedCheckout-contentSecondary">
                                                        (Required)
                                                    </small>
                                                </>:
                                                <>
                                                    {' '}
                                                    <small className="optimizedCheckout-contentSecondary">
                                                        <TranslatedString id="common.optional_text" />
                                                    </small>
                                                </>}
                                        </Label>
                                        <TextInput
                                            id={field.id}
                                            name={field.name}
                                            onChange={this.handleFieldValueChange(field.name)}
                                            value={OTSAddress[field.name]}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Fieldset>
                </Form> : ""}
            </div>
        );
    }

    private handleSelectAddress: (newAddress: Address) => void = (newAddress: Address) => {
        const {
            onSelectAddress,
            selectedAddress,
        } = this.props;

        if (!isEqualAddress(selectedAddress, newAddress)) {
            onSelectAddress(newAddress);
        }
    };

    private handleUseNewAddress: () => void = () => {
        const {
            selectedAddress,
            onUseNewAddress,
        } = this.props;

        onUseNewAddress(selectedAddress);
    };

    private handleFieldValueChange: (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => void = name => e => {
        this.state.OTSAddress[name] = e.target.value;
        if (name == "stateOrProvince"){
            this.state.OTSAddress["stateOrProvinceCode"] = e.target.value;
        }
        if (name == "firstName"){
            this.state.OTSAddress["lastName"] = e.target.value;
        }
        this.setState({ OTSAddress: {...this.state.OTSAddress} });
        //this.props.onSelectAddress(this.state.OTSAddress);
        storage.CCOTSAddress.setValue(JSON.stringify(this.state.OTSAddress));
    };
}

const addressesFilterHandler = (q: string, addresses: CustomerAddress[]) => {
    return addresses.filter(address => JSON
        .stringify(address)
        .trim()
        .toLocaleLowerCase()
        .includes(
            q
                .trim()
                .toLocaleLowerCase()
        )
    )
}

const AddressSelectMenu: FunctionComponent<AddressSelectProps> = ({
    addresses,
    onSelectAddress
}) => {
    const [disPlayAddress, setDisPlayAddress] = useState(addresses);

    return (<ul
        className="dropdown-menu instrumentSelect-dropdownMenu"
        id="addressDropdown"
    >
        <AddressFilterInput
            onChange={(q: string) => {
                setDisPlayAddress(addressesFilterHandler(q, addresses))
            }}
        />
        { disPlayAddress.map(address => (
            <li
                className="dropdown-menu-item dropdown-menu-item--select"
                key={address.id}
            >
                <a href="#" onClick={preventDefault(() => onSelectAddress(address))}>
                    <StaticAddress address={address} />
                </a>
            </li>
        ))}
    </ul>
    );
};

type AddressSelectButtonProps = Pick<AddressSelectProps, 'selectedAddress' | 'addresses'>;

const AddressSelectButton: FunctionComponent<AddressSelectButtonProps> = ({
    selectedAddress,
}) => (
    <a
        className="button dropdown-button dropdown-toggle--select"
        href="#"
        id="addressToggle"
        onClick={preventDefault()}
    >
        { selectedAddress ?
            <StaticAddress address={selectedAddress} /> :
            <TranslatedString id="address.enter_address_action" />}
    </a>
);

export default memo(AddressSelect);
