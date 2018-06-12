function generateRandomString() {

 return Math.random().toString(36).substring(2,5) + Math.random().toString(36).substring(2,5);
}

console.log(generateRandomString());