module.exports = func => {// this would be used to wrap our async functions so that we dont have to do try catch for each one
    return (req,res,next) => {
        func(req,res,next).catch(next);
    }
}