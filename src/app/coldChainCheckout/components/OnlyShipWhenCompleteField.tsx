import React, { memo, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import { CheckboxInput } from '../../ui/form';

export interface OnlyShipWhenCompleteFieldProps {
    onChange?(e: React.ChangeEvent<HTMLInputElement>): void;
    value: string
}

const OnlyShipWhenCompleteField: FunctionComponent<OnlyShipWhenCompleteFieldProps> = ({
    onChange,
    value
}) => {
    const labelContent = useMemo(() => (
        <TranslatedString id="shipping.onlyShipWhenComplete_label" />
    ), []);

    return <CheckboxInput
        checked={(value === "Y")?true:false}
        id="onlyShipWhenComplete"
        label={labelContent}
        onChange={onChange}
        value={value}
    />
};

export default memo(OnlyShipWhenCompleteField);
