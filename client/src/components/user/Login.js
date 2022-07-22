import { Close, Send } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material'
import React from 'react'
import { useValue } from '../../context/ContextProvider'
import GoogleOneTapLogin from './GoogleOneTapLogin'
import PasswordField from './PasswordField'

function Login() {
    
    const {state: {openLogin}, dispatch} = useValue()
    const [title, setTitle] =React.useState('Login')
    const [isRegister, setIsRegister] = React.useState(false)
    const nameRef = React.useRef()
    const emailRef = React.useRef()
    const passwordRef = React.useRef()
    const confirmPasswordRef = React.useRef()

    const handleClose = () => {
        dispatch({type:'CLOSE_LOGIN'})
    }
    const handleSubmit = (e) =>{
        e.preventDefault()
        const email = emailRef.current.value
        const password = passwordRef.current.value
        // send login request if  is not register and returns

        const name = nameRef.current.value
        const confirmPassword = confirmPasswordRef.current.value
        if(password === confirmPassword) {
            return dispatch({type:'UPDATE_ALERT', severity: 'error', message: "Passwords  do not match"})
        }
        // send register request
    }
    React.useEffect(() =>{
        isRegister ? setTitle('Register') : setTitle('Login')
    }, [isRegister])
  return (
    <Dialog open={openLogin}
    onClose={handleClose}
    >
        <DialogTitle>
            {title}
            <IconButton
            sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: (theme) => theme.palette.grey[500]
            }}
            onClick={handleClose}>
           
                <Close/>
            </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
            <DialogContent dividers>
                Please fill your information in the fields below:
          
            {isRegister && 
            <TextField autoFocus
            margin='normal'
            variant='standard'
            id='name'
            label='Name'
            type='text'
            fullWidth
            inputRef={nameRef}
            inputProps={{minLength: 2}}
            required 
            />}
            <TextField autoFocus= {!isRegister}
            margin='normal'
            variant='standard'
            id='email'
            label='Email'
            type='email'
            fullWidth
            inputRef={emailRef}
            required 
            />
            <PasswordField {...{passwordRef}}/>
            {isRegister && <PasswordField  passwordRef = {confirmPasswordRef} id='confirmPassword' label='Confirm Password'/>}
              </DialogContent>

              <DialogActions sx={{px:'19px'}}>
                <Button type='submit' variant='contained' endIcon={<Send />}>
                    Submit
                </Button>
              </DialogActions>
        </form>

        <DialogActions sx={{justifyContent: 'left', p:'5px 24px'}}>
            {isRegister ? 'Do you have an account? Sign in now ': "Don't you have an account? Create one now"}
            <Button onClick={()=>{setIsRegister(!isRegister)}}>
                {isRegister ? 'Login' : 'Register'}
            </Button>
        </DialogActions>
        <DialogActions sx={{justifyContent: 'center' , py: '24px'}}>
            <GoogleOneTapLogin/>
        </DialogActions>

    </Dialog>
  )
}

export default Login