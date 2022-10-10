const Campground = require('../models/campground');
const Review = require('../models/review')

module.exports.createReview = async (req, res) => { // this creates the review
    const campground = await Campground.findById(req.params.id);
    const review = new Review (req.body.review); // creates the new reviews
    review.author = req.user._id;
    campground.reviews.push(review); //pushes said reviews to the campground 
    await review.save(); //saves the review
    await campground.save(); //saves the campground now with the review
    req.flash('success','Created A New Review')
    res.redirect(`/campgrounds/${campground._id}`);// redirects you to the page now with the review
}

module.exports.deleteReview = async (req, res) => {// this deletes the reviews
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); 
    req.flash('success','Successfully deleted your review')
    res.redirect(`/campgrounds/${id}`);
}