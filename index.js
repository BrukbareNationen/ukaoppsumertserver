const Joi = require('joi');
const express = require('express');
const { send } = require('express/lib/response');
const func = require('joi/lib/types/func');
const app = express();

app.use(express.json());

const content = {
  title: "Tittel",
  desc: "Beskrivelse",
  tag: "Serie",
  img: "#",
  seriesUrl: "#",
  itemWidth: 480,
  articles: [
      {
          url: 1,
          uuid: "e4266d54-ca1e-546c-848e-21e8f10c1928",
          title: "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      },
      {
          url: 2,
          uuid: "e7a0770f-b59d-5386-a202-2f708e33db54",
          title: "Rasmus Hansson: – Hvis EU-avtalen raserer norsk landbruk, stemmer jeg nei"
      },
      {
          url: 3,
          uuid: "e4266d54-ca1e-546c-848e-21e8f10c1928",
          title: "Siv og Tor Erik tror neppe de vil tjene på å bygge om til løsdrift, men snart må de velge"
      },
      {
          url: 4,
          uuid: "e4266d54-ca1e-546c-848e-21e8f10c1928",
          title: "Siste slide"
      }
  ]
}

app.get('/', (req, res) => {
  res.send('Da er vi i gang da.. Ukas Viktigste API');
});

app.get('/api/articles',(req,res) => {
  res.send(content.articles);
});


app.post('/api/articles', (req , res) => {
  const {error} = validatearticle(req.body);
  if(error) return res.status(400).send(error.details[0].message);
    

  const article = {
    url: content.articles.length + 1,
    uuid: req.body.uuid,
    title: req.body.title
  };
  content.articles.push(article);
  res.send(article);
});

app.post('/api/articles/all', (req, res) => {
  content.articles = [];
  req.body.forEach(foo => {

    // console.log(foo);
    // const {error} = validatearticle(foo);
    // if(error) return res.status(400).send(error.details[0].message);

    const article = {
      url: content.articles.length + 1,
      uuid: foo.uuid,
      title: foo.title
    };

    content.articles.push(article);
  });
  res.send(content.articles);
});

app.put('/api/articles/:url', (req, res) => {
  const article = content.articles.find(c => c.url === parseInt(req.params.url));
  if(!article)  return res.status(404).send(`Artikkel med gitt URL finnes ikke 
  ${req.params.url}`);

  
  const {error} = validatearticle(req.body);
  if(error) return res.status(400).send(error.details[0].message);
   

  if(req.body.uuid) article.uuid = req.body.uuid;
  if(req.body.title) article.title = req.body.title;
  res.send(article);
});

app.delete('/api/articles/:url', (req, res) => {
  //Look up the article
  //not existing, return 404
  const article = content.articles.find(c => c.url === parseInt(req.params.url));
  if(!article) return res.status(404).send('Artikkel med gitt URL finnes ikke');

  //delete
  const index = content.articles.indexOf(article);
  content.articles.splice(index, 1);
  //return the same article
  res.send(article);
});



app.get('/api/articles/:url', (req, res) => {
  const article = content.articles.find(c => c.url === parseInt(req.params.url));
  if(!article) return res.status(404).send(`Artikkel med gitt URL finnes ikke ${req.params.url}`);
  res.send(article);
});
  





// PORT
const port = process.env.PORT || 3000;

console.log(process.env.PORT);
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
})


function validatearticle(article) {
  const schema = {
   uuid: Joi.string().min(10).max(30),
   title: Joi.string().min(7)
  };

  return Joi.validate(article, schema);
}