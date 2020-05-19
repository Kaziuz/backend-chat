const express = require('express')
const cors = require('cors')
const passport = require('passport')
const InstagramStrategy = require('passport-instagram').Strategy
const chalk = require('chalk')
const dotenv = require('dotenv')

let user = {}

////////////////////////////////////////////////////////////////
// PASSPORT services config
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})
//////////////////////////////////////

const app = express()
dotenv.config({ path: './config.env' })

app.use(cors())

///////////////////////////////////////////////
// instagram strategy auth user
passport.use(new InstagramStrategy({
  clientID: process.env.CLIENT_ID_INS,
  clientSecret: process.env.CLIENT_SECRET_INS,
  callbackURL: "/auth/instagram/callback", // callback after user acept give data this app
  proxy: true
},
async (accessToken, refreshToken, profile, done) => {
  console.log('profile', chalk.blue(JSON.stringify(profile)))
  user = { ...profile}
  return done(null, profile)
}
))
///////////////////////////////////////

app.use(passport.initialize())

// 1. el usuario se loguea
app.get("/auth/instagram", passport.authenticate("instagram"))
// 2. cuando el usuario concede acceso a la app, manejamos la respuesta de los servidores facebook/instagram
app.get('/auth/instagram/callback', passport.authenticate("instagram"), (req, res) => {
  res.send("redireccionar")
})

app.get("/auth/logout", (req, res) => {
  user = {}
  req.logout()
  res.redirect("/")
})

const port = process.env.PORT || 5000 

app.listen(port, () => {
  console.log('server runing', port)
})

