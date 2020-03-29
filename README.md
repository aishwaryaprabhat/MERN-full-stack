# MERN-full-stack
Full stack development project using MERN Stack (MongoDB, Express, React, Node)

Technologies used:
1. ES6+
2. Async/Await
3. React Hooks
4. Redux With DevTools
5. JSON Web Tokens
6. Postman HTTP Client
7. Mongoose/MongDB/Atlas
8. Bcrypt Password Hashing
8. Heroku and Git Deployment

Installation Stuff

```
npm init
npm i express express-validator bcryptjs config gravatar jsonwebtoken mongoose request
npm i -D nodemon concurrently
```

Simple server 

```
const express  = require('express');

const app = express();

app.get('/', (req, res)=> res.send('API Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log(`Server started on port ${PORT}`))

```