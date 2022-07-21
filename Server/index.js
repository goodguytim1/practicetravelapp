// Server index.js file
// All the important stuff!
// Express mongodb cors, all data in json format!
const express = require('express');
const TravellerModel = require("./models/Traveller")
const AgentModel = require("./models/Agent")
const mongoose = require('mongoose');
const cors = require("cors");
const { fromUnixTime } = require('date-fns');
const { body, validationResult } = require('express-validator');
const { default: formatRelativeWithOptions } = require('date-fns/fp/formatRelativeWithOptions/index.js');
const app = express();
require("dotenv").config();
// CONNECT
mongoose.connect(process.env.mongodb, {
    useNewUrlParser: true,
})

// SET LIMITS FOR IMAGES
app.use(express.json({limit: '50mb', extended: true}));
app.use(cors());
app.get('/', async(req, res) =>{
    console.log("/")
    res.send('Hello World')
});
app.post('/agent', body('firstName').isLength({min:1}), body('lastName').isLength({min:1}), body('email').isEmail(), body('password').isLength({min:8}), async(req, res) => {
    const errors = validationResult(req);
    console.log('post agent')
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    console.log(req.params)
    console.log(req.body)
    let email = req.body.email
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let password = req.body.password;
    const agent = new AgentModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        trips: []
    })
    try {   
        AgentModel.findOne({email:email}, (err, result) =>{
            if(err) {
                console.log(err)
            }
            if(result) {
                console.log(result)
                res.send("email taken")
            }else {
                
                agent.save((err, result) =>{
                    if(err){
                        console.log(err);
                    }
                    console.log("new agent created")
                    res.send(result);
                    
                })
                
            }
        });

    }
    
    catch (err){
        console.log(err)
    }
})


app.get('/agent', async(req, res) => {
    console.log('get agent')
    try {
        AgentModel.findOne({email: req.body.email}, (err, result)=>{
            if(err) {
                res.send(err)
            }
            if(result){
            
                res.send(result)
            }
            else {
                res.send("no agent found")
            }
        })
    }
    catch(e) {
        res.send(e)
    }
})

app.delete('/agent', async(req, res) => {
    console.log('delete agent')
    try {
        AgentModel.deleteOne({email: req.body.email}, (err, result) => {
            if(err) {
                res.send(err)
            }
            if(result){
            
                res.send(result)
            }else {
                res.send("no agent found")
            }
        })
    }
    catch(e) {
        res.send(e)
    }
})
app.put('/agent', async(req, res) => {
    console.log('edit agent')
    try {
        AgentModel.updateOne({email:req.body.ogEmail}, {$set: {email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName }})
                .then(result=> {
                    console.log(result)
                    res.send(result)})
                .catch(err => res.send(err))
    }
    catch(e) {
        res.send(e)
    }
})


app.post('/client', async(req, res) =>{
    console.log("add client")
    let agentEmail = req.body.agentEmail;
    let clientEmail = req.body.clientEmail;

    try{
        AgentModel.find((err, result) => {
            if(err) {
                res.send(err)
                return
            }
            if(result) {
                console.log(clientEmail)
                let agentClaimed = result.filter(r => 
                    r.clients.filter(c => 
                        c.clientEmail === clientEmail
                    ).length > 0
                )
                console.log(agentClaimed)
                if(agentClaimed.length > 0) {
                    res.send("email taken")
                }else {
                    let agent = result.filter(r => 
                        r.email === agentEmail
                    );
                    agent = agent[0]
                    // console.log(agent)
                    console.log(agentEmail)
                    agent.clients.push({clientEmail: clientEmail, registered: false, trips: []})
                    AgentModel.updateOne({email:agentEmail}, {$set: {clients: agent.clients}})
                    .then(res2 => res.send(res2))
                    .catch(err => res.send(err))
                }
                // result.forEach(r => {
                //     r.clients.forEach(client=> {
                //         if(client.clientEmail === clientEmail) {
                //             res.send("email in use")
                //             return
                //         }
                //     })
                // })
                // let agent = result.filter(r=>r.email === agentEmail)[0]
                
                // return
            }else {
                res.send("no result")
                return
            }
        })
       
    }
    catch(e){
        res.send(e)
    }
})


app.get('/client', async(req, res)=>{
    console.log("get client")
    let clientEmail = req.query.clientEmail;
    //console.log(req.body)
    //console.log(req.params)
    console.log(req.query)
    try{
        AgentModel.find((err, result) => {
            if(err) {
                console.log(err)
                res.send(err)
            }
            else {
                let trips = [];
                console.log(req.params)
                console.log(clientEmail)
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        if(result[i].clients[j].clientEmail == clientEmail) {
                            console.log("found")
                            res.send(result[i].clients[j])
                            return
                        }
                    }
                }
                res.send("not invited")
            
            }
        })
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }

})

app.delete('/client', async(req, res)=>{
    console.log("delete client")
    let clientEmail = req.body.clientEmail;
    try{
        AgentModel.find((err, result) => {
            if(err) {
                console.log(err)
                res.send(err)
            }
            else {
                let trips = [];
                let email = null, newClients;
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                      
                        if(result[i].clients[j].clientEmail == clientEmail) {
                            email = result[i].email
                            newClients = result[i].clients.filter(c => c.clientEmail !== clientEmail)
                            
                            
                        }
                    }
                }
                if(email) {
                    AgentModel.updateOne({email: email}, {$set: {clients: newClients}})
                            .then((r) => res.send(r))
                            .catch((e) => res.send(e))
                }else {
                    res.send("no client with that email")
                }
                
            }
        })
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }

})

app.put('/client', async(req, res)=>{
    console.log("edit client")

    let clientEmail = req.body.clientEmail;
    try{
        AgentModel.find((err, result) => {
            if(err) {
                console.log(err)
                res.send(err)
            }
            else {
                let newClients = null;
                let agentEmail = null;
                let client = null;
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        console.log(result[i])
                        if(result[i].clients[j].clientEmail == clientEmail) {
                            console.log(result[i])
                            agentEmail = result[i].email;
                            client = result[i].clients[j];
                            
                            newClients = result[i].clients;
                        }
                    }
                }
                client.registered = true;
                            client.password = req.body.password;
                            client.firstName = req.body.firstName;
                            client.trips = client.trips;
                            client.lastName = req.body.lastName;
                            
                // console.log(agentEmail)
                    AgentModel.updateOne({email: agentEmail}, {$set: {clients: newClients}})
                    .then((r) => res.send(r))
                    .catch(e => res.send(e))
           
            
            }
        })
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }

})

app.get('/clients', async(req, res) => {
    console.log("get clients")
    let agentEmail = req.body.agentEmail;
    console.log(agentEmail)
    try {   
        AgentModel.findOne({email:agentEmail}, (err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                res.send(result.clients)
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})


app.delete('/clients', async(req, res) => {
    let agentEmail = req.body.agentEmail;
    console.log(agentEmail)
    try {   
        AgentModel.findOne({email:agentEmail}, (err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                AgentModel.updateOne({email:agentEmail}, {$set: {"clients": []}}) 

                .then(res2 => res.send(res2))
                .catch(err => res.send(err))
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})

app.post('/trip', async(req, res) =>{
    console.log(req.body)
    let email = req.body.email
    let tripName = req.body.tripName
    let tripDate = req.body.tripDate

    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                console.log("result")
                let agentEmail = null;
                let newClients = null
                let clientFound = false
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        //console.log(result[i])
                        if(result[i].clients[j].clientEmail == email && !clientFound) {
                            // console.log(result[i])
                            clientFound = true
                            console.log(result[i]);
                            agentEmail = result[i].email;
                            let client = result[i].clients[j];
                            client.trips.push({"tripName": tripName, "tripDate": tripDate, stops: []})
                            newClients = result[i].clients;
                        }
                    }
                }
                console.log(newClients, agentEmail)
                AgentModel.updateOne({email: agentEmail}, {$set: {clients: newClients}})
                .then((r) => {
                    console.log(r)
                    res.send(r)
                }).catch((e) => {
                    res.send(e)
                })
            
            }else {


                
                console.log("no account found")
                res.send("nothing")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})

app.get('/trip', async(req, res) =>{
    console.log(req.body)
    let email = req.body.email
    let tripName = req.body.tripName
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                console.log(result)
                // let agentEmail = null;
                // let newClients = null
                let client = null;
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        //console.log(result[i])
                        if(result[i].clients[j].clientEmail == email) {
                            // console.log(result[i])
                            // agentEmail = result[i].email;
                            client = result[i].clients[j];
                            
                            // client.trips.push({"tripName": tripName, "tripAgent": tripAgent, "tripDate": tripDate, "tripCategores": tripCategories, stops: []})
                            // newClients = result[i].clients;
                        }
                    }
                }
                let trip = client.trips.filter(t=>t.tripName === tripName);
                if(trip.length > 0) {
                    res.send(trip[0])
                }else {
                    res.send("No trips found")
                }
                // AgentModel.updateOne({email: agentEmail}, {$set: {clients: newClients}})
                // .then((r) => {
                //     res.send(r)
                // }).catch((e) => {
                //     res.send(e)
                // })
            
            }else {


                
                console.log("no account found")
                res.send("nothing")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})


app.delete('/trip', async(req, res) =>{
    console.log(req.body)
    console.log(req.query)
    console.log(req.params)
    let email = req.query.email
    let tripName = req.query.tripName
    
   
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
               // console.log(result)
                // let agentEmail = null;
                let newClients = null
                let client = null;
                let agentEmail = null;
                let clientFound = false;
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        //console.log(result[i])
                        if(result[i].clients[j].clientEmail == email && !clientFound) {
                            console.log("client found")
                            clientFound = true
                            client = result[i].clients[j];
                            newClients = result[i].clients;
                            agentEmail = result[i].email;
                        }
                    }
                }
                console.log(client)
                client.trips = client.trips.filter(t=>t.tripName !== tripName);

                console.log(client.trips)
                console.log(newClients)
                AgentModel.updateOne({email:agentEmail}, {$set: {clients: newClients}})
                .then(r=>res.send(r))
                .catch(e=>res.send(e))
               
            
            }else {


                
                console.log("no account found")
                res.send("nothing")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})

app.put('/trip', async(req, res) =>{
    console.log(req.body)
    let email = req.body.email
    let tripName = req.body.ogTripName
    let newTripName = req.body.tripName
    let tripDate = req.body.tripDate
    let tripAgent = req.body.tripAgent
    let tripCategories = req.body.tripCategories
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                console.log(result)
                // let agentEmail = null;
                let newClients = null
                let client = null;
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        console.log(result[i].clients[j])
                        if(result[i].clients[j].clientEmail == email) {
                            client = result[i].clients[j];
                            newClients = result[i].clients;
                        }
                    }
                }
                client.trips = client.trips.map(t=>t.tripName === tripName ? {tripName: newTripName, tripDate: tripDate, tripAgent: tripAgent, tripCategories: tripCategories, stop: t.stops} : t);
                AgentModel.updateOne({email:email}, {$set: {clients: newClients}})
                .then(r=>res.send(r))
                .catch(e=>res.send(e))
               
            
            }else {


                
                console.log("no account found")
                res.send("nothing")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})

app.post('/stop', async(req, res) =>{
    //console.log(req.body)
    console.log("new stop")
    let email = req.body.email
    let tripName = req.body.tripName
    let stopName = req.body.stopName
    let stopAddress = req.body.stopAddress
    let stopDate = req.body.stopDate
    let stopLocation = req.body.stopLocation
    let stopNotes = req.body.stopNotes
    let stopPicture = req.body.stopPicture


    console.log(req.body)
    //console.log(email)
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                
                let newClients = null
                let client = null;
                let trip = null;
                let agentEmail = null;
      
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                       // console.log(result[i].clients[j])
                        if(result[i].clients[j].clientEmail == email) {
                            console.log("found" + tripName)
                            client = result[i].clients[j];
                            agentEmail = result[i].email
                            newClients = result[i].clients;
                            for(let k = 0; k < client.trips.length; k++) {
                                if(client.trips[k].tripName === tripName) {
                                    console.log("found trip " + tripName)
                                    trip = client.trips[k];

                                    trip.stops.push({stopName, stopAddress, stopDate, stopLocation, stopNotes, stopPicture})
                                    console.log(trip)
                                    AgentModel.updateOne({email:agentEmail}, {$set: {clients: newClients}})
                                    .then(r=> {console.log(r);res.send(r);})
                                    .catch(e=>res.send(e))
                                    return
                                }
                            }
                        }
                    }
                }
               console.log("miss")
                    res.send("nothing found")

            }else {


                console.log("no account found")
                res.send("no account found")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})

app.get('/stop', async(req, res) =>{
    //console.log(req.body)
    console.log("get stop")
    let email = req.body.email
    let tripName = req.body.tripName
    let stopName = req.body.stopName
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                
                let newClients = null
                let client = null;
                let trip = null;
                console.log(email)
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        console.log(result[i].clients[j])
                        if(result[i].clients[j].clientEmail == email) {
                            client = result[i].clients[j];
                            newClients = result[i].clients;
                            for(let k = 0; k < client.trips.length; k++) {
                                if(client.trips[k].tripName === tripName) {
                                 
                                    trip = client.trips[k];
                                    let stop = trip.stops.filter(s=>s.stopName == stopName);
                                    if(stop.length > 0) {
                                        res.send(stop[0])
                                    }else{
                                        res.send("no stop found")
                                    }
                                    
                                    
                                }
                            }
                        }
                    }
                }
                // AgentModel.updateOne({email:email}, {$set: {clients: newClients}})
                // .then(r=>res.send(r))
                // .catch(e=>res.send(e))


            }else {


                console.log("no account found")
                res.send("no account found")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})

app.delete('/stop', async(req, res) =>{
    //console.log(req.body)
    console.log("delete stop");
    console.log(req.query)
    let email = req.query.email
    let tripName = req.query.tripName
    let stopName = req.query.stopName
    console.log(req.body)
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                
                let newClients = null
                let client = null;
                let trip = null;
                let agentEmail = null;
                //console.log(email)
                for(let i = 0; i < result.length; i++) {
                    console.log(result[i].email)
                    for(let j = 0; j < result[i].clients.length; j++) {
                        //console.log(result[i])
                        if(result[i].clients[j].clientEmail == email) {
                            client = result[i].clients[j];
                            newClients = result[i].clients;
                            agentEmail = result[i].email;
                            for(let k = 0; k < client.trips.length; k++) {
                                console.log(client.trips[k].tripName)
                                if(client.trips[k].tripName === tripName) {
                                    
                                    trip = client.trips[k];
                                    
                                    console.log(trip)
                                       
                                    
                                }
                            }
                        }
                    }
                }
                trip.stops = trip.stops.filter(s=>s.stopName !== stopName)
                console.log(newClients[1].trips[0].stops)
                AgentModel.updateOne({email:agentEmail}, {$set: {clients: newClients}})
                .then(r=>res.send(r))
                .catch(e=>res.send(e))


            }else {
                console.log("no result")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})
app.put('/stop', async(req, res) =>{
    //console.log(req.body)
    console.log("edit stop")
    let email = req.body.email
    let tripName = req.body.tripName
    let stopName = req.body.ogStopName
    let newStopName = req.body.stopName
    let stopAddress = req.body.stopAddress
    let stopDate = req.body.stopDate
    let stopLocation = req.body.stopLocation
    let stopNotes = req.body.stopNotes
    let stopPicture = req.body.stopPicture
    try {   
        AgentModel.find((err, result) =>{
            if(err) {
                console.log(err)
                res.send(err)
            }
            if(result) {
                
                let newClients = null
                let client = null;
                let trip = null;
                let stop = null;
                console.log(stopName)
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        console.log(result[i].clients[j])
                        if(result[i].clients[j].clientEmail == email) {
                            client = result[i].clients[j];
                            newClients = result[i].clients;
                            for(let k = 0; k < client.trips.length; k++) {
                                if(client.trips[k].tripName === tripName) {
                                    trip = client.trips[k];
                                    console.log(trip.stops)
                                    console.log(trip.stops.filter(s=>s.stopName === stopName))
                                    stop = trip.stops.filter(s=>s.stopName === stopName)[0]
                                    stop.stopName = newStopName;
                                    stop.stopAddress = stopAddress;
                                    stop.stopDate = stopDate;
                                    stop.stopLocation = stopLocation;
                                    stop.stopNotes = stopNotes;
                                    stop.stopPicture = stopPicture;
                                    // trip.stops.push({stopName, stopAddress, stopDate, stopLocation, stopNotes, stopPicture})
                                    console.log(trip)
                                }
                            }
                        }
                    }
                }
                AgentModel.updateOne({email:email}, {$set: {clients: newClients}})
                .then(r=>res.send(r))
                .catch(e=>res.send(e))


            }else {


                console.log("no account found")
                res.send("no account found")
            }
        });
    }
    
    catch (err){
        console.log(err)
    }
})


app.get('/trips', async(req, res) => {
    try {
        AgentModel.find((err, result) => {
            if(err) {
                res.send(err)
            }
            if(result) {
                let myRes = [];
                for(let i = 0; i < result.length; i++) {
                    for(let j = 0; j < result[i].clients.length; j++) {
                        if(result[i].clients[j].trips !== undefined) {
                            for(let k = 0; k < result[i].clients[j].trips.length; k++) {
                                myRes.push(result[i].clients[j].trips[k]);
                            }
                        }
                        
                    }
                }
                res.send(myRes)
            }else{
                res.send("nothing")
            }
        })
    } catch(error) {
        res.send(error)
    }
})



app.get('/login', async(req, res) => {
    let email = req.query.email
    let password = req.query.password;
    console.log(email)
    console.log(password)
    console.log(req.query)
    try{
        AgentModel.findOne({email: email, password: password}, (err, result) => {
            if(err){
                console.log(err)
                res.send(err)
            }
            if(result){
                console.log(result)
                console.log("login traveller")
                res.send(result)
            }else{
                console.log("not an agent, try traveller?")
                // try{    
                    try {
                        AgentModel.find((err2, result) => {
                            if(err2) {
                                console.log(err2)
                                res.send(err2)
                            }if(result){
                                //console.log(result.filter(a=>a.clients.filter(c=>c.clientEmail === email && c.password === password).length> 0))
                                let agent = result.filter(a=>a.clients.filter(c=>c.clientEmail === email && c.password === password).length > 0)[0]
                                console.log(agent)
                                let client
                                if(agent) {
                                    client = agent.clients.filter(c=>c.clientEmail === email && c.password === password)[0];
                                }
                                
                                if(client) {
                                    res.send(client)
                                }else {
                                    res.send("invalid credentials")
                                }
                            }else {
                                res.send("nothing")
                            }
                        })
                    }catch(e) {
                        res.send(e)
                    }
                    

                // }
                // catch(err){
                //     console.log(err)
                // }
                //res.send("nothing found" + result)
                
            }
        })
    }catch(err) {console.log(err)}
})


// app.put('/resetTrips', async(req, res) => {
//     let email = req.body.email;

//     try{
//         TravellerModel.findOne({email:email}, (err, result) =>{
//             if(err) {
//                 console.log(err)
//                 res.send(err)
//             }
//             if(result) {
//                 TravellerModel.updateOne({email:email}, {$set: {"trips": []}}) 

//                 .then(res2 => res.send(res2))
//                 .catch(err => res.send(err))
//             }else{
//                 res.send("no account found")
//             }
//         })
//     }catch(err) {
//         res.send(err)
//     }
// })


// app.post('/stop', async(req, res) => {

//     console.log(req.body)
//     let email = req.body.email;
//     let tripName = req.body.selectedTrip;
//     let stopName = req.body.stopName;
//     let stopAddress = req.body.stopAddress;
//     let stopLocation = req.body.stopLocation;
//     let stopNotes = req.body.stopNotes;
//     let stopPicture = req.body.stopPicture;
//     let stopDate = req.body.stopDate;
//     console.log(req.body)
//     // let tripAgent = req.body.tripAgent;
//     // let tripDate = req.body.tripDate;
//     // let tripCategories = req.body.tripCategories;
//     try {   
//         AgentModel.find((err, result) =>{
//             if(err) {
//                 console.log(err)
//                 res.send(err)
//             }
//             if(result) {
//                 console.log(result)
//                 let trips = result.trips;
//                 // trips.push({tripName, tripAgent, tripDate, tripCategories, stops : []})
//                 // for(let i = 0 ; i < trips.length; i++){
//                 //     if(trips[i].tripName == tripName) {
//                 //         trips[i].stops.push({stopName, stopAddress, stopLocation, stopNotes, stopPicture, stopDate})
//                 //     }
//                 // }
                
//                 TravellerModel.updateOne({email:email}, {$set: {"trips": trips}}) 

//                 .then(res2 => res.send(res2))
//                 .catch(err => res.send(err))
                
//                 // res.send("email taken")
//                 // 
//             }else {


//                 // traveller.save((err, result) =>{
//                 //     if(err){
//                 //         console.log(err);
//                 //     }
//                 //     console.log("new traveller created")
//                 //     res.send(result);
                    
//                 // })
//                 console.log("no account found")
//                 res.send("no account found")
//             }
//         });

//     }
    
//     catch (err){
//         console.log(err)
//     }
// })

// app.put('/stop', async(req, res) =>{
//     console.log(req.body)
//     let email = req.body.email
//     let tripName = req.body.tripName
//     let stopName = req.body.stopName
//     let newName = req.body.newName
//     let stopDate = req.body.stopDate
//     let tripAgent = req.body.tripAgent
//     let tripCategories = req.body.tripCategories
//     try {   
//         TravellerModel.findOne({email:email}, (err, result) =>{
//             if(err) {
//                 console.log(err)
//                 res.send(err)
//             }
//             if(result) {
//                 console.log(result)
//                 let trips = result.trips;
//                 console.log(trips)

//               //  trips = trips.map(trip=> {trip.tripName === tripName ? {"tripName": newName, "tripAgent": tripAgent, "tripDate": tripDate, "tripCategores": tripCategories, stops: trip.stops} : trip})
//                 for(let i = 0; i < trips.length; i++) {
//                     if(trips[i].tripName === tripName) {
//                         trips[i].tripName = newName;
//                         trips[i].tripDate = tripDate;
//                         trips[i].tripAgent = tripAgent;
//                         trips[i].tripCategories = tripCategories;
//                     }
//                     // console.log(trips[i])
//                 }
//                 TravellerModel.updateOne({email:email}, {$set: {"trips": trips}}) 

//                 .then(res2 => res.send(res2))
//                 .catch(err => res.send(err))
//                 // TravellerModel.updateOne({email:email}, {$set: {"trips": trips}}) 
//                 // .then(res2 => res.send(res2))
//                 // .catch(err => res.send(err))
              
                
//                 // res.send("email taken")
//                 // 
//             }else {


//                 // traveller.save((err, result) =>{
//                 //     if(err){
//                 //         console.log(err);
//                 //     }
//                 //     console.log("new traveller created")
//                 //     res.send(result);
                    
//                 // })
//                 console.log("no account found")
//                 res.send("no account found")
//             }
//         });
//     }
    
//     catch (err){
//         console.log(err)
//     }
// })


// app.delete('/stop', async(req, res) => {
//     let email = req.body.email
//     let tripName = req.body.selectedTrip
//     let stopName = req.body.stopName
//     console.log(req.body)

//     try {   
//         TravellerModel.findOne({email:email}, (err, result) =>{
//             if(err) {
//                 console.log(err)
//                 res.send(err)
//             }
//             if(result) {
//                 console.log(result)
//                 let trips = result.trips;
//                 // trips.push({tripName, tripAgent, tripDate, tripCategories, stops : []})
//                 for(let i = 0 ; i < trips.length; i++){
//                     if(trips[i].tripName == tripName) {
//                         trips[i].stops = trips[i].stops.filter(stop=> stop.stopName !== stopName)
//                         TravellerModel.updateOne({email:email}, {$set: {"trips": trips}}) 

//                         .then(res2 => res.send(res2))
//                         .catch(err => res.send(err))
//                         return
//                     }
//                 }
//                 res.send("no trip")
              
                
//                 // res.send("email taken")
//                 // 
//             }else {


//                 // traveller.save((err, result) =>{
//                 //     if(err){
//                 //         console.log(err);
//                 //     }
//                 //     console.log("new traveller created")
//                 //     res.send(result);
                    
//                 // })
//                 console.log("no account found")
//                 res.send("no account found")
//             }
//         });

//     }
    
//     catch (err){
//         console.log(err)
//     }
 
// })




// app.get('/allTrips', async(req, res) => {
//     console.log("Get All Trips")


//     try{
//         TravellerModel.find((err, result) => {
//             if(err) {
//                 console.log(err)
//                 res.send(err)
//             }
//             else {
//                 let trips = [];
//                 for(let i = 0; i < result.length; i++) {
//                     for(let j = 0; j < result[i].trips.length; j++) {
//                         trips.push(result[i].trips[j]);
//                     }
//                 }
//                 console.log(trips)
//                 res.send(trips)
//             }
//         })
//     }
//     catch (err) {
//         console.log(err)
//     }
// })




// app.post('/newTrip', async(req, res) => {
//     console.log(req.body)
//     let email = req.body.email;
//     let tripName = req.body.tripName;
//     let tripAgent = req.body.tripAgent;
//     let tripDate = req.body.tripDate;
//     let tripCategories = req.body.tripCategories;
//     try {   
//         TravellerModel.findOne({email:email}, (err, result) =>{
//             if(err) {
//                 console.log(err)
//                 res.send(err)
//             }
//             if(result) {
//                 console.log(result)
//                 let trips = result.trips;
//                 trips.push({tripName, tripAgent, tripDate, tripCategories, stops : []})
//                 TravellerModel.updateOne({email:email}, {$set: {"trips": trips}}) 

//                 .then(res2 => res.send(res2))
//                 .catch(err => res.send(err))
                
//                 // res.send("email taken")
//                 // 
//             }else {


//                 // traveller.save((err, result) =>{
//                 //     if(err){
//                 //         console.log(err);
//                 //     }
//                 //     console.log("new traveller created")
//                 //     res.send(result);
                    
//                 // })
//                 console.log("no account found")
//                 res.send("no account found")
//             }
//         });

//     }
    
//     catch (err){
//         console.log(err)
//     }
// })

// app.post('/newTraveller', async(req, res) => {
//     console.log(req.params)
//     console.log(req.body)
//     let email = req.body.email
//     let firstName = req.body.firstName;
//     let lastName = req.body.lastName;
//     let password = req.body.password;
//     const traveller = new TravellerModel({
//         firstName: firstName,
//         lastName: lastName,
//         email: email,
//         password: password,
//         trips: []
//     })
//     try {   
//         TravellerModel.findOne({email:email}, (err, result) =>{
//             if(err) {
//                 console.log(err)
//             }
//             if(result) {
//                 console.log(result)
//                 res.send("email taken")
//             }else {
//                 traveller.save((err, result) =>{
//                     if(err){
//                         console.log(err);
//                     }
//                     console.log("new traveller created")
//                     res.send(result);
                    
//                 })
//             }
//         });

//     }
    
//     catch (err){
//         console.log(err)
//     }
// })
// RUNNING
app.listen(3001, ()=>{
    console.log("Server running on port 3001")
});