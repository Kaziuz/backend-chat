const express = require('express')
const cors = require('cors')
const passport = require('passport')
const InstagramStrategy = require('passport-instagram').Strategy
const chalk = require('chalk')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

let user = {}

const app = express()

dotenv.config({ path: './config/dev.env' })
app.use(express.static(`${__dirname}/public`))
app.use(cors())
app.use(bodyParser.json())

////////////////////////////////////////////////////////////////
// PASSPORT services config
passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// instagram strategy auth user
passport.use(new InstagramStrategy({
  clientID: process.env.CLIENT_ID_INS,
  clientSecret: process.env.CLIENT_SECRET_INS,
  callbackURL: "/auth/instagram/callback" // callback after user acept give data this app
},
async (accessToken, refreshToken, profile, done) => {
  console.log('profile', chalk.blue(JSON.stringify(profile)))
  user = { ...profile}
  return done(null, profile)
}
))

// app.use(cors({
//   origin: "https://nuevo-chat-c43f5.web.app",
//   methods: "GET",
//   credentials: true
// }))

// cookie session
app.use(cookieSession({
  name: 'session-login',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias habilitada la cokoie
  keys: [process.env.COOKIE_KEY] 
}))

app.use(passport.initialize())
app.use(passport.session())

// 1. el usuario se loguea
app.get("/auth/instagram", passport.authenticate("instagram"))

// https://chat-app-bkend.herokuapp.com/auth/instagram/callback
// 2. cuando el usuario concede acceso a la app, manejamos 
// la respuesta de los servidores facebook/instagram
app.get('/auth/instagram/callback', passport.authenticate("instagram"), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'user login',
    user: req.user,
    cookies: req.cookies
  })
})

// 3. los datos enviados por parte del usuario no son validos
app.get('https://chat-app-bkend.herokuapp.com/auth/instagram/callback/fail', (req, res) => {
  res.status(401).json({
    status: 'error',
    message: 'data is bad'
  })
})

// url de solicitud de eliminación de datos
// https://chat-app-bkend.herokuapp.com/auth/instagram/eliminate

// https://chat-app-bkend.herokuapp.com/auth/logout
app.get("/auth/logout", (req, res) => {
  user = {}
  req.logout()
  res.redirect("/")
})

const port = process.env.PORT || 5000 

app.listen(port, () => {
  console.log('server runing', port)
})
