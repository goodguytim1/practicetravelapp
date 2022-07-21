import React from 'react'
import reducer from './reducer'
const initialState={
    currentUser:null,
    openLogin: false,
    loading: false,
    alert:{open: false, severity:'info', message: 'empty'}
}

const Context = React.createContext(initialState)

export const useValue= () => {
    return React.useContext(Context)
}
function ContextProvider({children}) {
    const [state, dispatch] = React.useReducer(reducer, initialState)
    React.useEffect(()=> {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'))
      if(currentUser){
        dispatch({type:'UPDATE_USER', payload: currentUser})
      }
    }, [])
  return (
    <Context.Provider value ={{state, dispatch}}>{children}</Context.Provider>
  )
}

export default ContextProvider