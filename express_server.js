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
// function for finding longURL

const findLongURL = function(userID, Db) {
  let longURL;
  for (let key in Db) {
    console.log('keys', key)
    if (key === userID) {
      longURL = Db[key].longURL 
    }
  };
    
    return longURL
}

// function that gets urls for user
const urlsForUser = function(userID) {

  let usersObject = {};
  for (const shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === userID) {

      usersObject[shortURL] = urlDatabase[shortURL]
    }
  }

  return usersObject;
}
// function to check if user exists
const getUserById = function(userDB, userID) {
  if (userDB[userID]) {
    return userDB[userID]
  } else {
    return null;
  }
}
// function to create new user
const createUser = function(email, password, users) {
  const userID = generateRandomString();


  users[userID] = {
    id: userID,
    email,
    password
  };

  return userID
}

// verify user email --> return user if email match or false if no match is found
const verifyEmail = function (email, password, users) {
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
  if(!userDB[req.cookies.user_id]) {
    return res.status(400).send('You are NOT logged in!! Please login here <a href="/login">login</a> or Register <a href = "/register">register</a> to view your urls');
  }
  const userID = req.cookies.user_id;


  const templateVars = { 
    user: getUserById(userDB, userID),
    urls: urlsForUser(userID)
  };

  res.render("urls_index", templateVars)
})


//route to render POST req
app.get("/urls/new", (req, res) => {
  if(!userDB[req.cookies.user_id]) {
    return res.status(400).send('You are NOT logged in!! Please login here <a href="/login">login</a> or Register <a href = "/register">register</a> to view your urls');
  }
  const userID = req.cookies.user_id;
  let user = getUserById(userDB, userID);

    const templateVars = {user};

    res.render("urls_new", templateVars)
})
// ****HELPING ACCESING KEYS OF THE OBJECT******//
// A route handler for passing data to urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log('shortUrl', shortURL)
  const userID = req.cookies.user_id;
  console.log('USERid', userID)
  let user = getUserById(userDB, userID);
  
  if(!urlDatabase[shortURL]) {
    res.send(error)
    return
  }

  if (userID !== urlDatabase[shortURL].userID) {
    res.send(error)
  }

  const longURL = urlDatabase[shortURL]['longURL'];

  const templateVars = { 
    shortURL,
    longURL,
    user
  }

  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})


//route to handle POST req and adding that new data to our database
app.post("/urls", (req, res) => {
  const userID = req.cookies.user_id
  const longURL = req.body.longURL
  const shortUrlKey = generateRandomString();
  
  urlDatabase[shortUrlKey] = {
    userID,
    longURL
  }
  
  res.redirect(`/urls`);
})

//router to redirect to the long Url given the shortURL
app.get('/u/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL; //res.params
  // const longURL = urlDatabase[req.params.shortURL].longURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL]['longURL'] : '';


  res.redirect(longURL);
  // [req.params.shortURL]
})
// router handle for delete req
app.post('/urls/:shortURL/delete', (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) {
    return res.send('You can not Delete this URL')
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})
//handler for update
app.post("/urls/:shortURL", (req, res) => {
  if(urlDatabase[req.params.shortURL].userID !== req.cookies.user_id) {
    return res.send('You can not Update this URL')
  }
  let shortURL = req.params.shortURL;
  let newLongURL = req.body.longURL
  urlDatabase[shortURL]['longURL']= newLongURL; //changed this

  res.redirect('/urls');
})
// handler for Post to login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = verifyEmail(email, password, userDB);

  if (user) {
    if (password === user.password) {
      res.cookie('user_id', user.id)
      res.redirect('/urls');
    } else {
      res.status(403).send('Wrong password')
    }
  } else {
    res.status(403).send('Register')
  }
    

})

// handler for logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login')
})

// handler to return a template for login

app.get('/login', (req, res) => {
  const userID = req.cookies.user_id;
  let user = getUserById(userDB, userID);
  const templateVars = {user};

  res.render('login', templateVars);
})

// handler to return template for register
app.get('/register', (req, res) => {
  const userID = req.cookies.user_id;
  let user = getUserById(userDB, userID);

  // let user = null
  const templateVars = {user};
  res.render('register', templateVars)
})



app.post('/register', (req, res) => {
  
  const {email, password} = req.body;
  
  if (email === '' && password === '') {
    return res.status(400).send('Email & password cannot be empty')
  }
  
  const userFound = verifyEmail(email, password, userDB);

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

});