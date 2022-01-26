import React, { FC, useContext, useState } from 'react'
import { TextInput, Legend } from '../../ui/form'
import AccordionContext from '../../ui/accordion/AccordionContext';

import storage from '../utils/storage'
import './styles.scss'
import { TranslatedString } from '../../locale';

const PO_NUMBER = 'cc-po-number'

const PoNumber:FC = () => {
  const { selectedItemId } = useContext(AccordionContext);
  const [poNumber, setPoNumber] = useState(storage.CCPoNumber.getValue() || '')
  const isSelected = selectedItemId === 'cheque'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPoNumber(val)
    val ? storage.CCPoNumber.setValue(val) : storage.CCPoNumber.removeValue()
  }

  return (
    <div className="cc-po-container" >
      <Legend className={isSelected ? 'inner-po-label': ''}>
        <label htmlFor={PO_NUMBER}>
          <span><TranslatedString id="payment.poNumber_label" /> </span>
        </label>
      </Legend>  
      <TextInput 
        name={PO_NUMBER}
        value={poNumber}
        onChange={handleInputChange}
      />
    </div>
  )
}

export default PoNumber