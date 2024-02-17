const express = require('express')
const router = express.Router()
const M16 = require('../models/M16')


router.get('/', async (req, res) => {
  
  res.render('index')

})

router.post('/', async (req, res) => {

  try {   
 
   /*  //  
    if (title === "Parts In Progress"){
       res.redirect('/') 
     }  
 */

  } catch {   
   
  }
})


module.exports = router