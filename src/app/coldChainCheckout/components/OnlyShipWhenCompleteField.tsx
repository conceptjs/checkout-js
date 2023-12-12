import React, { memo, useMemo, FunctionComponent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ReactTooltip from "react-tooltip";

import { TranslatedString } from '../../locale';
import { CheckboxInput } from '../../ui/form';
import withLanguage, { WithLanguageProps } from '../../locale/withLanguage';

export interface OnlyShipWhenCompleteFieldProps {
    onChange?(e: React.ChangeEvent<HTMLInputElement>): void;
    value: string
}

const OnlyShipWhenCompleteField: FunctionComponent<OnlyShipWhenCompleteFieldProps & WithLanguageProps> = ({
    onChange,
    value,
    language
}) => {
    const labelContent = useMemo(() => (
        <span>
            <TranslatedString id="shipping.onlyShipWhenComplete_label" />
            <FontAwesomeIcon data-for="main" data-tip={language.translate("shipping.onlyShipWhenComplete_help")} icon={faInfoCircle} className="cc-info-icon cc-info-icon-label"/>
            <ReactTooltip
                id="main"
                type="info"
                multiline={true}
            />
        </span>
    ), []);

    return <CheckboxInput
        checked={(value === "Y")?true:false}
        id="onlyShipWhenComplete"
        label={labelContent}
        onChange={onChange}
        value={value}
    />
};

export default memo(withLanguage(OnlyShipWhenCompleteField));
