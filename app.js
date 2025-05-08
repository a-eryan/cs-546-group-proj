import express from 'express';
const app = express()
import session from 'express-session';
import exphbs from 'express-handlebars'
import configRoutes from './routes/index.js'

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(
    session({
         name: 'AuthenticationState',
         secret: "some secret string!",
         saveUninitialized: false,
         resave: false
    })
)

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars')

// app.use('/', require('./routes/index'));
// app.use('/study-spots', require('./routes/studySpots'));
// app.use('/forums', require('./routes/forumPosts'));
// app.use('/users', require('./routes/users'));
// app.use('/auth', require('./routes/auth'));

app.get('/', (req, res) => {
    res.redirect('/login');
});

configRoutes(app)

app.listen(3000, () => {
     console.log("We've now got a server!");
     console.log('Your routes will be running on http://localhost:3000');
})