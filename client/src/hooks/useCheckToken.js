import React from 'react'
import { useValue } from '../context/ContextProvider'
import jwtDecode from 'jwt-decode'

function useCheckToken() {
    const {state: {currentUser, }, dispatch} = useValue()
    React.useEffect(()=>{
        if(currentUser) {
            const decodedToken = jwtDecode(currentUser.token)
            if(decodedToken.exp *1000 < new Date().getTime()){
                dispatch({type: 'UPDATE_USER', payload: null})
            }
        }
    }, [])
  return (
    <div>useCheckToken</div>
  )
}

export default useCheckToken