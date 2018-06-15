const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set("view engine", "ejs");

//sets what port to receive requests from
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
};

function findUserByCookie(cookieID) {
  return users[cookieID];
};

function findUserByEmail(email) {
  for (id in users) {
    if (email === users[id]['email']) {
      return users[id];
    }
  }
};

function urlsForUser(cookieID) {
  const urlSubset = {};
  for (id in urlDatabase) {
    if (urlDatabase[id]['userID'] === cookieID) {
      urlSubset[id] = urlDatabase[id];
    }
  }
  return urlSubset;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});


//renders the urls_index html file
app.get("/urls", (req, res) => {
  let user = findUserByCookie(req.session.user_id);
  let userURLs = urlsForUser(req.session.user_id)
  let urlsIndex = {
    user: user,
    urls: userURLs
  };
  res.render('urls_index', urlsIndex);
});


//displays the page where the user enters a URL to shorten
app.get("/urls/new", (req, res) => {
  let user = findUserByCookie(req.session.user_id);
  let userShow = {user};
  console.log(user);
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", userShow);
  };
});

//generates the page that the user is redirected to when they
//submit a url to shorten
app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id]['longURL'];
  let user = findUserByCookie(req.session.user_id);
  let databaseID = urlDatabase[req.params.id]['userID'];
  if (!user) {
    res.send("Please log in.");
  } else if (databaseID !== user['id']) {
    res.send("You do not have access to this URL.")
  } else {
    var urlsShow = {
      shortURL: req.params.id,
      longURL: longURL,
      user: user
    };
  }
  res.render('urls_show', urlsShow);
});

//redirects the user to the long URL associated with the short URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL)
  res.redirect(301, longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  res.render("urls_register.ejs")
});

app.get("/login", (req, res) => {
  res.render("urls_login.ejs");
});

//adds the generated short URL and the associated
//long URL to the database object
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString()
  let user = findUserByCookie(req.session.user_id);
  urlDatabase[shortURL] = {
    longURL: req.body['longURL'],
    userID: user['id']
  };
  res.redirect('/urls/' + shortURL)
});

//deletes the associated short and long URLs when the user
//clicks the submit button
app.post("/urls/:id/delete", (req, res) => {
  let user = findUserByCookie(req.session.user_id);
  let userID = user['id']
  let databaseID = urlDatabase[req.params.id].userID;
  if (userID !== databaseID) {
    res.send("not today!")
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls")
  }
});

//edits the associated short URL with the new long URL
//input by the user
app.post("/urls/:id", (req, res) => {
  let user = findUserByCookie(req.session.user_id);
  let userID = user['id']
  let databaseID = urlDatabase[req.params.id].userID;
  if (userID !== databaseID) {
    res.send("not today!")
  } else {
    urlDatabase[req.params.id]['longURL'] = req.body.newURL;
    //console.log(urlDatabase[req.params.id]['longURL'])
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let user = findUserByEmail(req.body.email);
  if (!user || user === undefined) {
    res.status(403).send("User not found.")
    return;
  }
  if (!bcrypt.compareSync(req.body.password, user['password'])) {
    res.status(403).send("Incorrect password.")
    return;
  } else {
    req.session.user_id = user['id'];
  }
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//adds the person
app.post("/register", (req, res) => {
  let user_id = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  for (id in users) {
    if (req.body.email === users[id]['email']) {
      res.status(400).send("Email already exists.");
    } else if (!req.body.email || !req.body.password) {
      res.status(400).send("Email or password is empty");
    } else {
      users[user_id] = {
        id: user_id,
        email: req.body.email,
        password: hashedPassword
      }
      req.session.user_id = user_id;
    };
  };
  res.redirect("/");
});