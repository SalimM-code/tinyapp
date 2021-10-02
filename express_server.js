const {getUserByEmail} = require('./helper');
const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
const bodyParser = require("body-parser");
// const cookie = require('cookie-parser');
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

// MIDDLEWARE
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(
        cookieSession({
          name: "session",
          keys: ['wait what that it?']
        }));

//DATABASES
const urlDatabase = {
  "b2xVn2": {
    // shortURL: 'b2xVn2',
    longURL: "http://www.lighthouselabs.ca",
    userID: 'aJ481W'
  },

  "9sm5xK": {
    // shortURL: '9sm5xK',
    longURL: "http://www.google.com",
    userID: 'aJ481W'
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

// HELPER FUNCTIONS

const urlsForUser = function(userID) {
  let usersObject = {};
  for (const shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === userID) {
      usersObject[shortURL] = urlDatabase[shortURL]
    }
  }
  return usersObject;
}

const getUserById = function(userDB, userID) {
  if (userDB[userID]) {
    return userDB[userID]
  } else {
    return null;
  }
}

const createUser = function(email, password, users) {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password
  };
  return userID
}

function generateRandomString() {
  let result = ' ';
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i ++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}



app.get("/", (req, res) => {
  res.redirect("/login");
});

// A route handler for Passing data to urls_index.ejs
app.get("/urls", (req, res) => {
  if(!userDB[req.session.user_id]) {
    return res.status(400).send('You are NOT logged in!! Please login here <a href="/login">login</a> or Register <a href = "/register">register</a> to view your urls');
  }
  const userID = req.session.user_id;
  const templateVars = { 
    user: getUserById(userDB, userID),
    urls: urlsForUser(userID)
  };
  res.render("urls_index", templateVars)
})

app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  let user = getUserById(userDB, userID);
  const templateVars = {user};

  res.render('login', templateVars);
})

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  let user = getUserById(userDB, userID);

  // let user = null
  const templateVars = {user};
  res.render('register', templateVars)
})
//route to render POST req
app.get("/urls/new", (req, res) => {
  if(!userDB[req.session.user_id]) {
    return res.status(400).send('You are NOT logged in!! Please login here <a href="/login">login</a> or Register <a href = "/register">register</a> to view your urls');
  }
  const userID = req.session.user_id;
  let user = getUserById(userDB, userID);

    const templateVars = {user};

    res.render("urls_new", templateVars)
})
// ****HELPING ACCESING KEYS OF THE OBJECT******//
// A route handler for passing data to urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {

  if (!user[req.session.user_id]) {
    return res.send('Please <a href="/login">login</a> to view your short Urls');
  }

  if(!urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send('You dont have access to viewing this url');
  }

  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: user[req.session.user_id]
  }

  res.render("urls_show", templateVars);
})

app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL; //res.params

  const longURL = urlDatabase[shortURL]['longURL']

  res.redirect(longURL);

})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})


//route to handle POST req and adding that new data to our database
app.post("/urls", (req, res) => {
  const userID = req.session.user_id
  const longURL = req.body.longURL
  const shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
    userID,
    longURL
  }

  res.redirect(`/urls/${shortURL}`);
})

app.post('/urls/:shortURL/delete', (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send('You can not Delete this URL')
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})
//handler for update
app.post("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send('You can not Update this URL')
  }
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL
  urlDatabase[shortURL]['longURL']= newLongURL; //changed this

  res.redirect('/urls');
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  // const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  if (email === '' && hashedPassword === '') {
    return res.status(400).send('Email & password cannot be empty')
  }
  const userFound = getUserByEmail(email, userDB);
  if (userFound) {
    res.status(400).send('Sorry, that user already exists!');
    return;
  }
  // if user is false, create new user
  const userID = createUser(email, hashedPassword, userDB)
  //set cookie to the userID
  req.session.user_id = userID
  res.redirect('/urls')
})
// handler for Post to login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  // const password = req.body.password;
  const user = getUserByEmail(email, userDB);
  if (user) {
    if (hashedPassword === user.password) {
      req.session.user_id = user.id
      res.redirect('/urls');
    } else {
      res.status(403).send('Wrong Information!! Try again <a href="/login">login</a>')
    }
  } else {
    res.status(403).send('Register <a href="/register">register</a> here!!')
  }
    console.log('user', user);
})
// handler for logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login')
})
app.post('/register', (req, res) => {
  const email = req.body.email;
  // const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  if (email === '' && hashedPassword === '') {
    return res.status(400).send('Email & password cannot be empty')
  }
  const userFound = getUserByEmail(email, userDB);
  if (userFound) {
    res.status(400).send('Sorry, that user already exists!');
    return;
  }
  // if user is false, create new user
  const userID = createUser(email, hashedPassword, userDB)
  //set cookie to the userID
  req.session.user_id = userID
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}`);
});