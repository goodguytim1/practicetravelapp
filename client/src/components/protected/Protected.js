import React from 'react'
import { useValue } from '../../context/ContextProvider'
import AccessMessage from './AccessMessage'

function Protected({children}) {
    const {state: {currentUser}} = useValue()
  return (
    currentUser ? children: <AccessMessage/>
  )
}

export default Protected