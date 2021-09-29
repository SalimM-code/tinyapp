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
const createUser = function(email, password, users) {
  const userID = generateRandomString();
  // console.log(userID);

  users[userID] = {
    id: userID,
    email,
    password
  };

  return userID
}

// verify user email --> return user if email match or false if no match is found
const verify = function (email, password, users) {
  // find user by email
  for (let userID in users) {
    const user = users[userID]
    if (email === user.email) {
      return user
    }
  }
  return false
}

app.get("/", (req, res) => {
  res.redirect("/login");
});


// A route handler for Passing data to urls_index.ejs
app.get("/urls", (req, res) => {
  const cookieVal = req.cookies.user_id;
  let user = getUserObject(userDB, cookieVal);
  const templateVars = { 
    user,
    urls: urlDatabase
  };
  // console.log(templateVars);
  res.render("urls_index", templateVars)
})


//route to render POST req
app.get("/urls/new", (req, res) => {
  const cookieVal = req.cookies.user_id;
  let user = getUserObject(userDB, cookieVal);
  const templateVars = {user};

  res.render("urls_new", templateVars)
})

// A route handler for passing data to urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const cookieVal = req.cookies.user_id;
  let user = getUserObject(userDB, cookieVal);

  const templateVars = { 
    shortURL,
    longURL,
    user
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
  res.clearCookie('user_id');
  res.redirect('/urls')
})

// handler to return a template for login

app.get('/login', (req, res) => {
  const cookieVal= req.cookies.user_id;
  let user = getUserObject(userDB, cookieVal);
  const templateVars = {user};
  res.render('login', templateVars);
})

// handler to return template for register
app.get('/register', (req, res) => {
  const cookieVal = req.cookies.user_id;
  let user = getUserObject(userDB, cookieVal);

  // let user = null
  const templateVars = {user};
  res.render('register', templateVars)
})



app.post('/register', (req, res) => {
  console.log('req.body', req.body);
  
  const {email, password} = req.body;

  if (email === '' && password === '') {
    return res.status(400).send('Email & password cannot be empty')
  }

  const userFound = verify(email, password, userDB);
  if (userFound) {
    res.status(400).send('Sorry, that user already exists!');
    return;
  }

  // if user is false, create new user
  const userID = createUser(email, password, userDB)

  //set cookie to the userID
  res.cookie('user_id', userID)

  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});