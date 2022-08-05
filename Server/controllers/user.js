import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import tryCatch from "./utils/tryCatch.js"
import Room from '../models/Room.js'
export const  register = tryCatch( async (req, res) => {

       // console.log("attempt to register")
        //console.log(req)
        const {name, email, password} = req.body
        if(password.length < 6) return res.status(400).json({success: false, message:'Password must be 6 characters or more'})
        const emailLowerCase = email.toLowerCase()
        const existedUser = await User.findOne({email: emailLowerCase})
        if(existedUser){
            return res.status(400).json({success:false, message: 'User already exists!'})
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({
            name,
            email: emailLowerCase,
            password:hashedPassword
        })
        const {_id:id, photoURL} = user
        const token = jwt.sign({id, name, photoURL}, process.env.JWT_SECRET, {expiresIn: '1h'})
        res.status(201).json({success: true, result: {id, name, email: user.email, photoURL, token}})
        //console.log("success")

})


export const login = tryCatch(async(req, res) => {
    //console.log("attempt to register")
    //console.log(req)
    console.log("attempt to login")
    const {email, password} = req.body

    const emailLowerCase = email.toLowerCase()
    console.log(emailLowerCase)
    const existedUser = await User.findOne({email: emailLowerCase})
    //console.log(existedUser)
    if(!existedUser){
        return res.status(404).json({success:false, message: 'User does not exist!'})
    }


    const correctPassword = await bcrypt.compare(password, existedUser.password)
    if(!correctPassword) return res.status(400).json({success: false, message:'Invalid Credentials'})

    const {_id:id,name, photoURL} = existedUser
    const token = jwt.sign({id, name, photoURL}, process.env.JWT_SECRET, {expiresIn: '1h'})
    res.status(200).json({success: true, result: {id, name, email: emailLowerCase, photoURL, token}})
    //console.log("success")
})


export const updateProfile = tryCatch(async (req, res) => {
    //console.log("update profile")
    //console.log(req.body)
    //const newBody = {...req.body, user: undefined}
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {new:true})
    const {_id: id, name, photoURL} = updatedUser
    await Room.updateMany({uid: id},{uName: name, uPhoto: photoURL})
    //TO DO: update all the room records by this user
    const token = jwt.sign({id, name, photoURL}, process.env.JWT_SECRET, {expiresIn: '1h'})

    res.status(200).json({success:true, result: {name, photoURL, token}})
})