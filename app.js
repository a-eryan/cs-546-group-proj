const express = require('express');
const session = require('express-session');
const handlebars = require('express-handlebars');

app.use('/', require('./routes/index'));
app.use('/study-spots', require('./routes/studySpots'));
app.use('/forums', require('./routes/forumPosts'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));