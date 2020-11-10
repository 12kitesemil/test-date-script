const puppeteer = require('puppeteer');
const moment = require('moment')

require('dotenv').config()


const pause = function (time) {
  console.log(`Waiting ${time / 1000} seconds...`)
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}



let date = moment().add(1, 'month').format('DD-MM-YYYY')



const check = async () => {

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


  searchResult = searchResult.trim()



  //if there is no dates found
  if (searchResult.length === 16) {

    //add a week to the booking date

    date = moment(date, 'DD-MM-YYYY').add(7, 'days').format('DD-MM-YYYY')


    //run search again with new date?
    await browser.close();
    await pause(10500)
    check()

  } else {
    console.log('found something!')
    await page.screenshot({ path: 'test-found.png' })
  }

};

check()
