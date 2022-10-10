const User = require('../models/user');

// here we are rendering  the page to register
module.exports.renderRegister = (req, res) => {  
    res.render('users/register')
}

// here we are registering a user not logging them in 
module.exports.register = async (req, res, next) => { 
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username }); 
        const registeredUser = await User.register(user, password); // this will get the user and hash their password with salt 
        req.login(registeredUser, err => { // established a login session
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp');
            res.redirect('/campgrounds')
        })
    } catch (e) { 
        req.flash('error', e.message); 
        res.redirect('register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
} 

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    })

}