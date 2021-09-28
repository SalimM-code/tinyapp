const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


function generateRandomString() {
  let result = ' ';
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i ++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {longURL: "http://www.google.com"}
};

app.get("/", (req, res) => {
  res.send("Hello!");
});


// A route handler for Passing data to urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log({urls: urlDatabase});
  res.render("urls_index", templateVars)
})


//route to render POST req
app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})

// A route handler for passing data to urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const templateVars = { 
    shortURL,
    longURL
  }
  console.log(templateVars);

  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})
//route to handle POST req
app.post("/urls", (req, res) => {
  
  const newKey = generateRandomString();
  urlDatabase[newKey] = {
    longURL: req.body.longURL
  }
  res.redirect(`/urls/${newKey}`);
})

//router to handle shortURL request
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});