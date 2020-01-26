const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.use(express.urlencoded({extended: false})) // for parsing application/x-www-form-urlencoded

app.use(session({
    secret: 'A#SFDASD#R$WT$T$T$#WT',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

const users = [
    {
        username: 'keriel',
        password: '111111',
        displayName: 'Mr.Keriel'
    }
]

app.get('/', (req, res) => {
        if (req.user && req.user.displayName) {
            res.send(`
                <h1>Hello, ${req.user.displayName}</h1>
                <a href="/logout">logout</a>
            `);
        } else {
            res.send(`
                <h1>Login</h1>
                <form action="/login" method="post">
                    <p>
                        <input type="text" name="username" placeholder="username">
                    </p>
                    <p>
                        <input type="password" name="password" placeholder="password">
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                <p>
                    <a href="/register">Register</a>
                </p>
            `);
        }
    }
);

app.get('/register', (req, res) => {
    const output = `
        <h1>Register</h1>
            <form action="/register" method="post">
                <p>
                    <input type="text" name="username" placeholder="username">
                </p>
                <p>
                    <input type="password" name="password" placeholder="password">
                </p>
                <p>
                    <input type="text" name="displayName" placeholder="displayName">
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
        `;
    res.send(output);
});

app.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const displayName = req.body.displayName;
    const user = {
        username: username,
        password: password,
        displayName: displayName
    };
    users.push(user);
    req.login(user, (err) => {
       req.session.save(()=>{
           res.redirect('/');
       });
    });
});

passport.serializeUser((user, done) => {
    console.log('serializeUser', user);
    done(null, user.username);
});

passport.deserializeUser((id, done) => {
    console.log('deserializeUser', id)
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (id === user.username) {
            return done(null, user);
            // req.user 객체 생성
        }
    }
});

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            if (username === user.username) {
                console.log('LocalStrategy', user);
                if (password === user.password) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            }
        }
        return done(null, false);
    }
));

app.post('/login',
    passport.authenticate(
        'local',
        {
            successRedirect: '/',
            failureRedirect: '/',
            failureFlash: false
        }
    )
);
app.get('/logout', (req, res) => {
    req.logout();
    req.session.save(() => {
        res.redirect('/');
    });
});
app.listen(3000, () => {
    console.log('Connected 3000 port !\nhttp://localhost:3000');
});