const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favourites = require('../models/favorite')
const favoriteRouter = express.Router();
var authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favourites.find({user:req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    let favorites=req.body;
    const dishes=favorites.map((favorite)=> favorite.id);
    Favourites.find({user:req.user._id})
    .then((favorite)=>{
        if(favorite.length==0)
        {
            return Favourites.create({user:req.user._id,"dishes":dishes});
        }
        else{
            return Favourites.find({user:req.user._id})
            .then((favorites)=>{
                let favorite=favorites[0];
                let arr=favorite.dishes;
                for(i=0;i<dishes.length;i++){
                    const id=dishes[i];
                    const index=arr.indexOf(id);
                    if(index == -1){
                        arr.push(id);
                    }
                }
                favorite.dishes=arr;
                return favorite.save();
            })
            .catch((err) => next(err));
        }
    })
    .then((favorite) => {
        console.log('Favourite Added ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.remove({user:req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /favorite/'
        + req.params.dishId );
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.find({user:req.user._id})
    .then((favorite)=>{
        if(favorite.length==0)
        {
            return Favourites.create({user:req.user._id,"dishes":[req.params.dishId]});
        }
        else{
            return Favourites.find({user:req.user._id})
            .then((favorites)=>{
                let favorite=favorites[0];
                const index=favorite.dishes.indexOf(req.params.dishId);
                if(index == -1){
                    favorite.dishes.push(req.params.dishId);
                    return favorite.save();
                }
            })
            .catch((err) => next(err));
        }
    })
    .then((favorite) => {
        console.log('Favourite Added ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorite/'
        + req.params.dishId );
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favourites.find({user:req.user})
    .then((favorites) => {
        if(favorites.length==0)
            return;
        const favorite=favorites[0];
        const arr=favorite.dishes.filter((dish)=> dish.toString()!==req.params.dishId.toString());
        favorite.dishes=arr;
        return favorite.save();
    }, (err) => next(err))
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    })
    .catch((err) => next(err));
});
module.exports = favoriteRouter;