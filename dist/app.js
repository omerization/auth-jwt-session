"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//necessary imports:
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_session_1 = __importDefault(require("express-session"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const path_1 = __importDefault(require("path"));
const user_js_1 = __importDefault(require("./models/user.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("./middleware/auth"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '/views'));
app.use(express_1.default.static(__dirname + '/public'));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, connect_flash_1.default)());
dotenv_1.default.config();
const { TOKEN_KEY, MONGODB_URI } = process.env;
const MongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
app.use((0, express_session_1.default)({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
app.use(function (req, res, next) {
    res.locals.currentUser = req.session.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
//express configurations end
//mongoose configurations start
main().catch(err => console.log(err));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect(MONGODB_URI);
    });
}
//mongoose configurations end
// '/' url route renders login page
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('login');
}));
// '/login' url route renders login page
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('login');
}));
// '/login' url post route 
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user input
        const { email, password } = req.body;
        // Validate user input
        if (!(email && password)) {
            req.flash("error", "Mail ve şifre girmeniz gerekiyor!");
        }
        // Validate if user exist in our database
        const user = yield user_js_1.default.findOne({ email });
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            // Create token
            const token = jsonwebtoken_1.default.sign({ user_id: user._id, email }, TOKEN_KEY, {
                expiresIn: "2h",
            });
            // save user token
            user.token = token;
            // token added to cookies
            res.cookie('authToken', token);
            //save sessions
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect('/users');
            });
        }
        else {
            //if mail or password is wrong, give feedback to user and redirect login page
            req.flash("error", "Mail veya şifre yanlış.");
            res.redirect('/login');
        }
    }
    catch (err) {
        //if anything goes wrong, give feedback to user and redirect login page
        console.log(err);
        req.flash("error", "Mail veya şifre yanlış.");
        res.redirect('/login');
    }
}));
// '/register' url get route 
app.get('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.render('register');
}));
// '/register' url post route 
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get user input
        const { first_name, last_name, email, password } = req.body;
        // Validate user input
        if (!(email && password && first_name && last_name)) {
            req.flash("error", "Hepsi doldurulmalı!");
            res.redirect('/register');
        }
        // check if user already exist
        // Validate if user exist in our database
        const oldUser = yield user_js_1.default.findOne({ email });
        if (oldUser) {
            req.flash("error", "Bu üye zaten bulunuyor");
            res.redirect('/register');
        }
        //Encrypt user password
        const encryptedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create user in our database
        const user = yield user_js_1.default.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });
        // Create token
        const token = jsonwebtoken_1.default.sign({ user_id: user._id, email }, TOKEN_KEY, {
            expiresIn: "2h",
        });
        // save user token
        user.token = token;
        req.flash("success", "Başarıyla kaydoldunuz.");
        res.redirect('/login');
    }
    catch (err) {
        console.log(err);
    }
}));
// 'logout' get route
app.get('/logout', function (req, res) {
    // removes sessions and gives succesful feedback to user
    req.flash("success", "Çıkış yaptınız");
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
});
// '/users' get route, middlewares check JWT token and session info for authentication
app.get('/users', [auth_1.default.verifyJWTToken, auth_1.default.isLoggedIn], (req, res) => {
    user_js_1.default.find({}, (err, users) => {
        if (err) {
            console.log(err);
        }
        else {
            // send all users to the client side
            const allUsers = users;
            res.render('users', { users: allUsers });
        }
    });
});
// '/user-agreement' get route
app.get('/user-agreement', function (req, res) {
    res.render('user-agreement');
});
// 404 error page
app.use((req, res, next) => {
    res.status(404).render('404');
});
//express port selection
app.listen(3001, function () {
    console.log("Server has started");
});
