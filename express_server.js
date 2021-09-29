const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
const cookie = require('cookie-parser');
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());


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
  "b2xVn2": {
    shortURL: 'b2xVn2',
    longURL: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    shortURL: '9sm5xK',
    longURL: "http://www.google.com"
  }
};

const userDB = {
  "userID": {
    id: 'userID',
    email: 'user@email.com',
    password: 'whatever'
  },
  "userID": {
    id: 'userID',
    email: 'user2@email.com',
    password: 'user2password'
  }
}
// function to check if user exists
const getUserObject = function(userDB, userID) {
  if (userDB[userID]) {
    return userDB[userID]
  } else {
    return null;
  }
}
// function to create new user
const createUser = function(email, password, user) {
  const userID = generateRandomString();
  // console.log(userID);

  user[userID] = {
    id: userID,
    email,
    password
  };

  return userID
}

app.get("/", (req, res) => {
  res.redirect("/login");
});


// A route handler for Passing data to urls_index.ejs
app.get("/urls", (req, res) => {
  let userObj = getUserObject(userDB, req.cookies('user_id'));
  const templateVars = { 
    userObj,
    urls: urlDatabase
  };
  // console.log(templateVars);
  res.render("urls_index", templateVars)
})


//route to render POST req
app.get("/urls/new", (req, res) => {
  let userObj = getUserObject(userDB, req.cookies('user_id'));
  const templateVars = userObj;

  res.render("urls_new", templateVars)
})

// A route handler for passing data to urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { 
    shortURL,
    longURL,
    username: req.cookies['username']
  }
  // console.log(templateVars);

  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})


//route to handle POST req and adding that new data to our database
app.post("/urls", (req, res) => {
  
  const lngURL = req.body.longURL
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    shortURL,
    longURL: lngURL
  }
  res.redirect(`/urls/${shortURL}`);
})

//router to handle shortURL request
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL; //res.params
  let longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
  // [req.params.shortURL]
})
// router handle for delete req
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})
//handler for update
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL
  urlDatabase[shortURL].longURL = newLongURL;

  res.redirect('/urls');
})
// handler for Post to login
app.post('/login', (req, res) => {
  const username = req.body.username;
  // console.log(username)
  res.cookie('username', username)
  res.redirect('/urls');
})

// handler for logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls')
})

// handler to return template for register
app.get('/register', (req, res) => {
  let userObj = getUserObject(userDB, req.cookies('user_id'));
  const templateVars = userObj;
  res.render('register', templateVars)
})

app.post('/register', (req, res) => {
  console.log('req.body', req.body);
  
  const {email, password} = req.body;

  const userID = createUser(email, password, userDB)
  console.log(userID)

  //set cookie to the userID
  res.cookie('user_id', userID)
  console.log(userDB)

  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});