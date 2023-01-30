

const localStrategy= require("passport-local").Strategy;
const pool = require('../configs/dbconfig')
const bcrypt =require('bcryptjs')

function initialize(passport: { use: (arg0: any) => void; serializeUser: (arg0: (user: any, done: any) => any) => void; deserializeUser: (arg0: (id: any, done: any) => void) => void; }){
    const authenticateUser=(email: any,password: any,done: (arg0: null, arg1: boolean) => any)=>{
        console.log("entered authentication")
        pool.query(`select * from passport where email=$1`,[email],(err: any,result: { rows: string | any[]; })=>{
            if(err) console.log(err);
            console.log("res from 1 passport",result.rows)

            if(result.rows.length>0){
                const user= result.rows[0];
                bcrypt.compare(password,user.password,(err:any,ismatch:any)=>{
                    if(err) throw err

                    if(ismatch){
                        return done(null,user);

                    }else{
                        return done(null,false)
                    }
                })
              
            }else{
                console.log("user dosent exist from passport")
                return done(null,false)
            }
        })
    }
    passport.use(
        new localStrategy({
            usernameFeild:"email",
            passwordFeild:"password"
        },
        authenticateUser
        )
        );
    passport.serializeUser((user,done)=> done(null,user.id)  );

    passport.deserializeUser((id,done)=>{
        pool.query(`select * from passport where id=$1`,[id],(err:any,results:any)=>{
            if(err){
                throw err;
            }
            else {
                console.log("here")
                return done(null,results.rows[0])
            };
        })
    })
}

module.exports=initialize

