import React, { FC, useContext } from 'react'
import { Legend } from '../../ui/form'
import AccordionContext from '../../ui/accordion/AccordionContext';

import './styles.scss'
import withLanguage, { WithLanguageProps } from '../../locale/withLanguage';
import storage from '../utils/storage'

const Terms_Code = 'cc-terms-code'

const termsCodeMapping = new Map<string, string>([
  ["1/2P", ".5% 10 Days, Net 30"],
 	["1N30", "1% 10 Days, Net 30"],
 	["2N30", "2% 10 Days, Net 30"],
 	["2N45", "2% 10 Days, Net 45"],
  ["2N60", "2% 10 Days, Net 60"],
 	["215N", "2% 15 Days, Net 60"],
 	["2N31", "2% 30 Days, Net 31"],
 	["3N31", "3% 30 Days, Net 31"],
 	["60EM", "60 Days End of Month"],
 	["CIA", "Cash In Advance"],
 	["COD", "Cash On Delivery"],
 	["CC", "Credit Card"],
 	["IC", "Intercompany"],
 	["N10", "Net 10 Days"],
 	["N15", "Net 15 Days"],
 	["N20", "Net 20 Days"],
 	["N30", "Net 30 Days"],
 	["N45", "Net 45 Days"],
 	["N60", "Net 60 Days"]
]);

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
          <span>{language.translate("payment.termsCode_label")+" : "+((termsCodeMapping.get(address.TermsCode))?termsCodeMapping.get(address.TermsCode):address.TermsCode)} </span>
        </label>
      </Legend>  
    </div>
  )
}

export default withLanguage(TermsCode)