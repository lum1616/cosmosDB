const express = require('express')
const router = express.Router()
const M16 = require('../models/M16')
const path = require("path")
const PDFDocument = require('pdfkit')
const fs =require('fs')
const ExcelJS = require('exceljs')
const { domainToASCII } = require('url')
const { log } = require('console')
const wb = new ExcelJS.Workbook()
const axios = require('axios')
const { Query } = require('mongoose')
const moment = require('moment'); // require

var strDate , endDate

function convDate(dt) {
  let st = dt.split("-");
  let dd = st[2];
  let mm = st[1];
  let yy = "20"+ st[0].substring(2);
  let day = [yy, mm, dd].join('-')
  return day
}


// report for total usage for each material
function genTotExcel(res, dts, str, end) {

    let rcpList = [] 
    let siloList = [] 
    let siloNameList = []  

    dts.forEach(d => { 
      let position = rcpList.indexOf(d.rcpName)  
      if (position < 0) {
        rcpList.push(d.rcpName) 
      } 

      position = siloList.indexOf(d.siloNo)  
      if (position < 0) {
        siloList.push(d.siloNo) 
        siloNameList.push(d.matName) 
      } 
   }) 
   

   const totTargWt = [[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0]] 
   const totActWt = [[0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0]] 
   const totDiffWt = [[0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0]] 

   let i=1 

   //rcpList.forEach( rcp => { 
    dts.forEach(d => { 
      //if (d.rcpName == rcp) {
      

        siloList.forEach( s => { 
          if (s == d.siloNo) {
            let no = Number(d.siloNo) - 1 
            totTargWt[i-1][no] += Number(d.targWt) 
            totActWt[i-1][no] += Number(d.actWt) 
            totDiffWt[i-1][no] += Number(d.diffWt) 
          } 
        }) 
      //} 
    }) 
    //i++ 
   //})


  let fileName = 'sumTotal.xlsx'
  wb.xlsx.readFile(fileName).then(() => {
    const ws = wb.getWorksheet('Sheet1')
    ws.getCell('C2').value = str + " to " + end
  
    


    let cnt = 7
    let strCnt ='' 
    let j = 0 
 
    
    //rcpList.forEach(r => { 
      let k = 0 

      siloList.forEach(s => { 
        strCnt = cnt.toString() 
        let no = [Number(siloList[k])-1] 
     
        
        if (totTargWt[j][no] != "0") {
          //ws.getCell('A' +  strCnt).value = rcpList[j]
          ws.getCell('A' +  strCnt).value =     siloList[k] 
          ws.getCell('B' +  strCnt).value =     siloNameList[k] 
          ws.getCell('C' +  strCnt).value =    totTargWt[j][no] 
          ws.getCell('D' +  strCnt).value =     totActWt[j][no] 
          ws.getCell('E' +  strCnt).value =     totDiffWt[j][no]
          ws.getCell('F' +  strCnt).value =     ((totDiffWt[j][no] / totTargWt[j][no]) * 100).toFixed(2) 
          
        } 
         k++ 
         cnt++
       }) 
      j++ 
     //}) 
  
     
    let fName = "Sum_" + dts[0].date  
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
     
    res.setHeader('Content-disposition', 'attachment; filename='+ fName +'.xlsx');
    wb.xlsx.write(res)    
  })

 .catch(err => {
    console.log(err.message);
  });
}


// report for every log
function genDetailExcel(res, dts, str, end) {
  
  let fileName = 'detail.xlsx'
  wb.xlsx.readFile(fileName).then(() => {
  const ws = wb.getWorksheet('Sheet1')  
  ws.getCell('E2').value = str + " to " + end

  let cnt = 6
  let strCnt ='' 
  let iTm = 0
  let i=1            
  dts.forEach(d => {
    strCnt = cnt.toString() 
    ws.getCell('A' +  strCnt).value = i
    ws.getCell('B' +  strCnt).value = d.date.substring(0,10)

    iTm = parseInt(d.date.substring(11,13))  

    
    let sTm = iTm.toString() + d.date.substring(13,19)  


    ws.getCell('C' +  strCnt).value = sTm

    ws.getCell('D' +  strCnt).value = d.rcpName 
    ws.getCell('E' +  strCnt).value = Number(d.batchNo)         
    ws.getCell('F' +  strCnt).value = Number(d.siloNo) 
    ws.getCell('G' +  strCnt).value = d.matName
    ws.getCell('H' +  strCnt).value = Number(d.targWt) 
    ws.getCell('I' +  strCnt).value = Number(d.actWt)
    ws.getCell('J' +  strCnt).value = Number(d.diffWt) 
    i++ 
    cnt++ 
   })

  let fName = "Detail_" + dts[0].date  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-disposition', 'attachment; filename='+ fName +'.xlsx');
  wb.xlsx.write(res)  

})

.catch(err => {
  console.log(err.message);
});
}



// All M16s Route
router.get('/', async (req, res) => {
 
  strDate= new Date().toJSON().slice(0, 10)
  endDate = new Date(strDate).toISOString().substring(0,10)
 
  try {
   query = M16.find( {
    'date': {
      $gte: new Date(strDate + "T00:00:00.000+08:00").toISOString(),
      $lt: new Date(endDate + "T24:00:00.000+08:00").toISOString()
    }
 } )


    const datas = await query.exec() 
    res.render('M16s/index', {
      datas: datas,
      str: strDate,
      end: strDate,
      searchOptions: req.query      
    })
  } catch {   
    console.log("err"); 
    res.redirect('/')
  }
})


// search 
router.post('/', async (req, res) => {
   
  strDate = convDate(req.body.strDt)
  endDate = convDate(req.body.endDt) 
  let tomorrow = new Date(endDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  try {
 
    let query = M16.find( {
      'date': {
        $gte: new Date(strDate ).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
        $lt: new Date(tomorrow).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
      }
   } )
    const datas = await query.exec() 
    res.render('M16s/index', {
      datas: datas,
      str : strDate,
      end : endDate, 
      searchOptions: req.query      
    })
  } catch {  
    console.log("err1");  
    res.redirect('/')
  }
})


// show data of total usage  
router.get('/:date', async (req, res) => {

    //let query = M16.find( { date: req.params.date})
  let tomorrow = new Date(endDate) 
  tomorrow.setDate(tomorrow.getDate() + 1)

  let query = M16.find( {
    'date': {
      $gte: new Date(strDate ).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
      $lt: new Date(tomorrow).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
    }
 } )
    
    try { 
      const datas = await query.exec()

      res.render('M16s/showData', {
        dts: datas,
        strDate: strDate,
        endDate: endDate,        
        searchOptions: req.query      
    
      })
      
    } catch {    
      res.redirect('/')
    }
  
  
})



// Print total usage
router.get('/:date/exceltot', async (req, res) => {

  //let query = M16.find({date: req.params.date}) 
  let tomorrow = new Date(endDate)
  tomorrow.setDate(tomorrow.getDate() + 1) 
  let query = M16.find( {
    'date': {
       $gte: new Date(strDate ).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
    $lt: new Date(tomorrow).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
    }
 } )

    try {

      const datas = await query.exec() 
      genTotExcel(res, datas, strDate, endDate)
      
    } catch {    
      res.redirect('/')
    }  
})


// Print Detail every log 
router.get('/:date/excelDetail', async (req, res) => {
  
  //let query = M16.find({date: req.params.date})
   
  let tomorrow = new Date(endDate) 
  tomorrow.setDate(tomorrow.getDate() + 1)
 
  let query = M16.find( {
    'date': {
      $gte: new Date(strDate ).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
        $lt: new Date(tomorrow).toISOString( "en-US", {timeZone: "Asia/Kuala_Lumpur"}),
    }

 } )

 
  try {
    const datas = await query.exec() 
    genDetailExcel(res, datas, strDate, endDate);

  } catch {    
    res.redirect('/')
  }  
})

module.exports = router