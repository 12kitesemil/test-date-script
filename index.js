const puppeteer = require('puppeteer');
const moment = require('moment')

require('dotenv').config()


const pause = function (time) {
  console.log(`Waiting ${time / 1000} seconds...`)
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}



let date = moment().format('DD/MM/YY')



check = async () => {

  console.log(`Searching for tests around ${date}....`)

  //headless needs to be set to false to bypass anitcrawling measure
  const browser = await puppeteer.launch({ headless: false });


  //console.log(await browser.userAgent());
  const page = await browser.newPage();

  await page.goto('https://www.gov.uk/book-driving-test');

  //click the link to start the aplication
  await Promise.all([
    page.click('.govuk-button--start', { delay: 120 }),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ])

  //select type of exam (car)
  await Promise.all([
    page.click('#test-type-car', { delay: 1000 }),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ])

  //enter driving licence details
  await page.type('#driving-licence', process.env.LICENCE_NUMBER, { delay: 100 })

  //select no special req radio buton
  await page.click('#special-needs-none', { delay: 120 })

  //click continue
  await Promise.all([
    page.click('#driving-licence-submit', { delay: 120 }),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ])

  //enter 'preferred' test date into the callendar
  await page.type('#test-choice-calendar', date, { delay: 500 })


  //click continue
  await Promise.all([
    page.click('#driving-licence-submit', { delay: 120 }),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ])

  //enter postcode
  await page.type('#test-centres-input', process.env.POSTCODE, { delay: 120 })


  //click continue
  await Promise.all([
    page.click('#test-centres-submit', { delay: 120 }),
    page.waitForNavigation({ waitUntil: "networkidle2" })
  ])


  //get the first h5 from teh page == results for the closest test centre 
  let searchResult = await page.evaluate(() => document.querySelector('h5').innerText);


  
  //If there is a test available, date is show in result
  const pattern = /\d/
  let containsNumber = pattern.test(searchResult)
  

  //if there is no dates found
  if (!containsNumber) {

    //add a week to the booking date
    date = moment(date, 'DD/MM/YY').add(1, 'month').format('DD/MM/YY')


    await browser.close();
    await pause(10500)
    check()

  } else {
    console.log('found something!')
    await page.screenshot({ path: 'test-found.png' })
  }

}

check()


//
// let str = '– available tests around 17/03/2021'
// let str2 = '- No dates available'

// const pattern = /\d/
// console.log(pattern.test(str))