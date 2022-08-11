const Joi = require('joi');
const config = require('./config.js');
const express = require('express');
const { send } = require('express/lib/response');
const func = require('joi/lib/types/func');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

let mode = '';

console.log(`NODE_ENV=${config.NODE_ENV}`);

app.use(express.json());
app.use(express.static('public'));
app.use(cors({
  origin:'*'
}));

// const TEMP_CONTENT = {
//   title: "Tittel",
//   desc: "Beskrivelse",
//   tag: "Serie",
//   img: "#",
//   seriesUrl: "#",
//   itemWidth: 480,
//   articles: [{
      //   "url": 1,
      //   "uuid": "e4266d54-ca1e-546c-848e-21e8f10c1928",
      //   "alt" : "Luftfoto av Meraker Brug. Foto: Meraker Brug",
      //   "summary" : ["første punkt", "andre punkt", "tredje punkt"],
      //   "title": "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      // }, {
      //   "url": 2,
      //   "uuid": "e4266d54-ca1e-546c-848e-21e8f10c1928",
      //   "alt" : "Luftfoto av Meraker Brug. Foto: Meraker Brug",
      //   "summary" : ["første punkt", "andre punkt", "tredje punkt"],
      //   "title": "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      // }, {
      //   "url": 3,
      //   "uuid": "e4266d54-ca1e-546c-848e-21e8f10c1928",
      //   "alt" : "Luftfoto av Meraker Brug. Foto: Meraker Brug",
      //   "summary" : ["første punkt", "andre punkt", "tredje punkt"],
      //   "title": "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      // }, {
      //   "url": 4,
      //   "uuid": "e4266d54-ca1e-546c-848e-21e8f10c1928",
      //   "alt" : "Luftfoto av Meraker Brug. Foto: Meraker Brug",
      //   "summary" : ["første punkt", "andre punkt", "tredje punkt"],
      //   "title": "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      // }, {
      //   "url": 5,
      //   "uuid": "e4266d54-ca1e-546c-848e-21e8f10c1928",
      //   "alt" : "Luftfoto av Meraker Brug. Foto: Meraker Brug",
      //   "summary" : ["første punkt", "andre punkt", "tredje punkt"],
      //   "title": "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      // }]
// }

app.get('/', (req, res) => {
  // res.send('Da er vi i gang da.. Ukas Viktigste API');
  console.log(__dirname)
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/api/articles',(req,res) => {
  let now = getNow();
  let logtext = "get-request to /api/articles";
  

  logAccess(logtext, now);
  

  let foontent = JSON.parse(readFile('./public/ukasviktigste.json')); 
  res.send(foontent);
});

app.post('/api/articles', (req , res) => {
  let foontent = JSON.parse(readFile('./public/ukasviktigste.json'));

  const {error} = validatearticle(req.body);
  if(error) return res.status(400).send(error.details[0].message);
    

  const article = {
    id: foontent.articles.length + 1,
    url: req.body.url,    
    uuid: req.body.uuid,
    alt: req.body.alt,
    title: req.body.title,
    summary: req.body.summary
  };
  foontent.articles.push(article);
  writeFile('./public/ukasviktigste.json', JSON.stringify(foontent));
  res.send(article);
});

app.post('/api/articles/all', (req, res) => {

  let foontent = JSON.parse(readFile('./public/ukasviktigste.json'));
  foontent.articles = []; //tømmer gammel data
  
  foontent.display = req.body.display;
  req.body.articles.forEach(foo => {

    console.log(foo);
    const {error} = validatearticle(foo);
    if(error) return res.status(400).send(error.details[0].message);

    const article = {
      id: foontent.articles.length + 1,
      url: foo.url,    
      uuid: foo.uuid,
      alt: foo.alt,
      title: foo.title,
      summary: foo.summary
    };

    foontent.articles.push(article);
  });

  logAccess("post-request to /api/articles/all", getNow())
 
  writeFile('./public/ukasviktigste.json', JSON.stringify(foontent));
  res.send(foontent.articles);
});

// app.put('/api/articles/:id', (req, res) => {
//   let foontent = JSON.parse(readFile('./public/ukasviktigste.json'));

//   const article = foontent.articles.find(c => c.id === parseInt(req.params.id));
//   if(!article)  return res.status(404).send(`Artikkel med gitt URL finnes ikke 
//   ${req.params.url}`);
  
//   const {error} = validatearticle(req.body);
//   if(error) return res.status(400).send(error.details[0].message);
   
//   if(req.body.url) article.uuid = req.body.url;
//   if(req.body.uuid) article.uuid = req.body.uuid;
//   if(req.body.title) article.title = req.body.title;
//   writeFile('./public/ukasviktigste.json', JSON.stringify(foontent))
//   res.send(article);
// });

// app.delete('/api/articles/:id', (req, res) => {
//   let foontent = JSON.parse(readFile('./public/ukasviktigste.json'));
//   //Look up the article
//   //not existing, return 404
//   const article = foontent.articles.find(c => c.id === parseInt(req.params.id));
//   if(!article) return res.status(404).send('Artikkel med gitt URL finnes ikke');

//   //delete
//   const index = foontent.articles.indexOf(article);
//   foontent.articles.splice(index, 1);
//   //return the same article
//   writeFile('./public/ukasviktigste.json', JSON.stringify(foontent));
//   res.send(article);
// });

// app.get('/api/articles/:id', (req, res) => {

//   let foontent = JSON.parse(readFile('./public/ukasviktigste.json'));

//   const article = foontent.articles.find(c => c.id === parseInt(req.params.id));
//   if(!article) return res.status(404).send(`Artikkel med gitt URL ${req.params.id} finnes ikke `);
//   res.send(article);
// });

app.get('/api/test', (req, res) => {
 res.send(readFile('./public/ukasviktigste.json')) 

})


// PORT
// const port = process.env.PORT || 3000;

// app.listen(config.PORT, config.HOST, () => {
//   console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
//   console.log(config.PW);
// })

app.listen(3000, () => {
  console.log('Server running and listening on port 3000')
});

//validates the sendt data
  //not correct validation jet
function validatearticle(article) {
  const schema = {
   url: Joi.string(),
   uuid: Joi.string().min(10).max(40),
   alt: Joi.string(),
   summary: Joi.array().items(Joi.string(), Joi.string(), Joi.string()),
   title: Joi.string().min(7)

  };

  return Joi.validate(article, schema);
}

//read and write functions

function readFile(file) {
  var content = fs.readFileSync(file, 'utf8');
  console.log("Read file");
  return content;
  
}

function writeFile(file, data) {
  fs.writeFileSync(file, data);
  let time = getNow();
  console.log("Written to file" , time);
}

function getNow() {   
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
}

function logAccess(text, date) {
  fs.writeFile('./public/log.txt', "\r\n" + text + " "+ date, { flag: 'a+' }, err => {
    if(err === null) return; 
    console.log('something wrong happened :(' + err)
  });
}