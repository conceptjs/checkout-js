import React, { FC, useContext } from 'react'
import { Legend } from '../../ui/form'
import AccordionContext from '../../ui/accordion/AccordionContext';

import './styles.scss'
import withLanguage, { WithLanguageProps } from '../../locale/withLanguage';
import storage from '../utils/storage'

const Terms_Code = 'cc-terms-code'

const TermsCode:FC<WithLanguageProps> = ({
  language
}) => {
  const { selectedItemId } = useContext(AccordionContext);
  const isSelected = selectedItemId === 'cheque'

  var address = JSON.parse(storage.CCAddresses.getValue());

  return (
    <div className="cc-po-container" >
      <Legend className={isSelected ? 'inner-po-label': ''}>
        <label htmlFor={Terms_Code}>
          <span>{language.translate("payment.termsCode_label")+" : "+address.TermsCode} </span>
        </label>
      </Legend>  
    </div>
  )
}

export default withLanguage(TermsCode)