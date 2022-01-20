"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware = {};
//function to check JWT token
middleware.verifyJWTToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        req.flash("error", "Tokenin yok");
        return res.redirect('/login');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
    }
    catch (err) {
        req.flash("error", "Geçersiz token");
        return res.redirect('/login');
    }
    return next();
};
//function to check if user is logged in
middleware.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        req.flash("error", "Giriş yapman lazım");
        return res.redirect('/login');
    }
    next();
};
exports.default = middleware;
