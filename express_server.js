const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
};

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//sets what to show according to the different URLs
app.get("/", (req, res) => {
  res.end("Hello!");
});
//deletes the associated short and long URLs when the user
//clicks the submit button
app.post("/urls/:id/delete", (req, res) => {
delete urlDatabase[req.params.id];
//console.log(req.params.id);
res.redirect("/urls")
});
//renders the urls_index html file
app.get("/urls", (req, res) => {
  let urlsIndex = {urls: urlDatabase};
  res.render('urls_index', urlsIndex);
});

//adds the generated short URL and the associated
//long URL to the database object
app.post("/urls", (req, res) => {
  //console.log(req.body);
  let shortURL = generateRandomString()  // debug statement to see POST parameters
  urlDatabase[shortURL] = req.body['longURL'];
  //res.send("Ok");
  res.redirect('/urls/' + shortURL)    // Respond with 'Ok' (we will replace this)
});
//displays the page where the user enters a URL to shorten
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  //console.log(req)
  res.redirect("/urls");
});
//generates the page that the user is redirected to when they
//submit a url to shorten
app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  //console.log(longURL)
  let urlsShow = { shortURL: req.params.id, longURL: longURL };
  res.render('urls_show', urlsShow);
});
//redirects the user to the long URL associated with the short URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(301, longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//app.get("/hello", (req, res) => {
  //res.end("<html><body>Hello <b>World</b></body></html>\n")
//});
//sets what port to receive requests from
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});