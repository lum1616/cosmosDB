if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
  
  const express = require('express')
  const app = express()
  const expressLayouts = require('express-ejs-layouts')
  const bodyParser = require('body-parser')
  const methodOverride = require('method-override')  
  const indexRouter = require('./routes/index')
  const M16Router = require('./routes/M16s')  
  const N530Router = require('./routes/N530')  
  
  
  app.set('view engine', 'ejs')
  app.set('views', __dirname + '/views')
  app.set('layout', 'layouts/layout')
  app.use(expressLayouts)
  app.use(methodOverride('_method'))
  app.use(express.static('public'))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
  
  const mongoose = require('mongoose')
  mongoose.connect("mongodb://127.0.0.1:27017/cosmosDB",{ useNewUrlParser: true,useUnifiedTopology: true })
  const db = mongoose.connection
  db.on('error', error => console.error(error))
  db.once('open', () => console.log('Connected to Mongoose'))
  
  app.use('/', indexRouter) 
  app.use('/M16s', M16Router)
  app.use('/N530', N530Router)
  
  
  app.listen(process.env.PORT || 3001)