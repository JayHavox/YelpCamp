const { campgroundSchema, reviewSchema } = require('./schemas.js');// we created a new file and are now requiring it so joi doesnt crowd the app page
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // this will be so that you have to be logged in to access this page
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //destructuring to get just the error and validating
    if (error) {
        const msg = error.details.map(el => el.message).join(',') // what this will do is get the details is an array of objects so we will map over them and make it into a string 
        throw new ExpressError(msg, 400) // this throw the error and sends them to the error page we created and no new obj is created
    } else {
        next();
    }
}

module.exports.isAuthor = async(req,res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) { // if current user doesnt own the campground it will then do below
    req.flash('error','You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req,res,next) => {// middleware that validates the review
  const {error} = reviewSchema.validate(req.body);
  if(error){
      const msg = error.details.map(el => el.message).join(',') // what this will do is get the details is an array of objects so we will map over them and make it into a string 
      throw new ExpressError(msg, 400) // this throw the error and sends them to the error page we created and no new obj is created
     } else {
      next();
     }
}

module.exports.isReviewAuthor = async(req,res, next) => {
  const {id, reviewId} = req.params;// getting the id from the route that we have set up for reviewId
  const review = await Review.findById(reviewId);
  if(!review.author.equals(req.user._id)) { // if current user doesnt own the campground it will then do below
  req.flash('error','You do not have permission to do that!');
  return res.redirect(`/campgrounds/${id}`)
  }
  next();
}