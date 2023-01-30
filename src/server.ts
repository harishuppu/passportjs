

import express, { Application,Request,Response} from 'express'
import path from 'path'
import pool from './configs/dbconfig'

const app:Application=express();
const bcrypt =require('bcryptjs')
const session = require('express-session')
const flash = require('express-flash')
const passport=require('passport')
const initializePassport= require('./configs/passport')

initializePassport(passport);

const port =3000

app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs")

app.use(express.urlencoded({extended:false}))
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize())
app.use(passport.session())
// app.use(flash());


app.get('/',(req:Request,res:Response)=>{
    res.render("index");
});

app.get('/users',(req:Request,res:Response)=>{
    pool.query(`select * from passport`,(err: any,result: any)=>{
        if(!err) res.send(result.rows)
        else res.send(err.message)
    })
})

app.get('/users/register',(req:Request,res:Response)=>{
    res.render("register");
})

app.get('/users/login',(req:Request,res:Response)=>{
    res.render("login");
})

app.get('/users/dashboard',(req:Request,res:Response)=>{
    res.render("dashboard");
})

app.post('/users/register',async(req:Request,res:Response)=>{
    console.log("before/===",req.body)
    let {name,email,password,confirmpassword}=req.body;
    
    if(!name || !email || !password || !confirmpassword) 
    console.log("please enter all feilds");

    if(password.length<6)
    console.log("password is too short");

    if(password!=confirmpassword)
    console.log("passwords didn't matched");
     
     let hashpassword= await bcrypt.hash(password,10);
    // const hashpassword=password

    await pool.query(`select * from passport where email=$1`,[email],(err: any,result: any)=>{
    if(err) throw err;
    if(result.rows.length>0){

        res.send("user already exists please go to login form")
    }
    else{
        pool.query(`INSERT INTO passport (name,email,password)
        VALUES ($1,$2,$3) RETURNING id,password`,[name,email,hashpassword],(err: any,result: any)=>{
            if(err) throw err;
           else{
            // console.log(result.rows);
            res.redirect('/users/login');
           
           }
        })
    }
})

app.post('/users/login',passport.authenticate('local',{ successRedirect:"/users/dashboard",failureRedirect:"/users/login"}))
    
})



app.listen(port,()=>{
    console.log(`app listening to port ${port}`)
})