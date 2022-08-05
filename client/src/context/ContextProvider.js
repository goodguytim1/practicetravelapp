import React from 'react'
import reducer from './reducer'
const initialState={
    currentUser:null,
    openLogin: false,
    loading: false,
    alert:{open: false, severity:'info', message: 'empty'},
    profile: {open: false, file: null, photoURL: ''},
    images: [],
    details: {title: '', description: '', price: 0},
    location: {lng: 0, lat:0},
    rooms: [],
    priceFilter: 50,
    addressFilter: null,
    filteredRooms: [],
    room: null,
}
console.log(initialState)

const Context = React.createContext(initialState)

export const useValue= () => {
    return React.useContext(Context)
}
function ContextProvider({children}) {
    const [state, dispatch] = React.useReducer(reducer, initialState)
    const mapRef = React.useRef()
    const containerRef = React.useRef()
    React.useEffect(()=> {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'))
      if(currentUser){
        dispatch({type:'UPDATE_USER', payload: currentUser})
      }
    }, [])
  return (
    <Context.Provider value ={{state, dispatch, mapRef, containerRef}}>{children}</Context.Provider>
  )
}

export default ContextProvider