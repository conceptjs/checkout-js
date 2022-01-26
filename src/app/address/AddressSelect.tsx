import { Address, CustomerAddress } from '@bigcommerce/checkout-sdk';
import React, { memo, FunctionComponent, PureComponent, ReactNode, useState } from 'react';

import { preventDefault } from '../common/dom';
import { TranslatedString } from '../locale';
import { DropdownTrigger } from '../ui/dropdown';

import isEqualAddress from './isEqualAddress';
import './AddressSelect.scss';
import StaticAddress from './StaticAddress';

import { AddressFilterInput } from '../coldChainCheckout';

export interface AddressSelectProps {
    addresses: CustomerAddress[];
    selectedAddress?: Address;
    onSelectAddress(address: Address): void;
    onUseNewAddress(currentAddress?: Address): void;
}

class AddressSelect extends PureComponent<AddressSelectProps> {
    render(): ReactNode {
        const {
            addresses,
            selectedAddress,
        } = this.props;

        return (
            <div className="form-field">
                <div className="dropdown--select" role="combobox">
                    <DropdownTrigger
                        dropdown={
                            <AddressSelectMenu
                                addresses={addresses}
                                onSelectAddress={this.handleSelectAddress}
                                onUseNewAddress={this.handleUseNewAddress}
                                selectedAddress={selectedAddress}
                            />
                        }
                    >
                        <AddressSelectButton
                            addresses={addresses}
                            selectedAddress={selectedAddress}
                        />
                    </DropdownTrigger>
                </div>
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
