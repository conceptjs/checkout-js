import React, { createRef, FC, useEffect } from 'react'
import { debounce } from 'lodash'
import TextInput from '../../ui/form/TextInput'

import './styles.scss'

import withLanguage, { WithLanguageProps } from '../../locale/withLanguage';

export interface AddressFilterInputProps {
  onChange: Function
}

const AddressFilterInput:FC<AddressFilterInputProps & WithLanguageProps> = ({
  onChange,
  language
}) => {
  const ref = createRef<HTMLDivElement>();
  const handleInputChange = debounce((val) => {
    onChange && onChange(val)
  }, 200)

  useEffect(() => {
    const { current } = ref
    current && (current.onclick = (e) => {
      e.stopPropagation()
    })

    return () => {}
  })

  return (
    <div className="cc-address-search-container" ref={ref}>
      <TextInput 
        placeholder={language.translate("shipping.searchAddress_label")}
        onChange={(e) => {
          handleInputChange(e.target.value)
        }}
      />
    </div>
  )
}

export default withLanguage(AddressFilterInput)