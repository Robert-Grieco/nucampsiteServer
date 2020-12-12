const express = require("express");
const Favorites = require("../models/favorites");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Campsite = require("../models/campsite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Favorites.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorites.findOne({ user: req.user._id })
        .then((favorites) => {
          if (favorites) {
            req.body.forEach((element) => {
              if (!favorites.campsites.includes(element._id)) {
                favorites.campsites.push(element._id);
              }
            });
            favorites.campsites.save();
            console.log("Campsite Created ", favorites);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorites);
          } else {
            Favorites.create({ user: req.user._id }).then((favorites) => {
              req.body.forEach((element) => {
                if (!favorites.campsites.includes(element._id)) {
                  favorites.campsites.push(element._id);
                }
              });
              favorites.campsites.save();
            })
            .catch((err) => next(err));
          }
        })
        .catch((err) => next(err));
    }
  )
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorites.findOneAndDelete()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
          res.end("You do not have any favorites to delete.");
        })
        .catch((err) => next(err));
    }
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end(`GET request not supported on /favorites/${req.params.campsiteId}`);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne();
  })
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403;
      res.end(
        `PUT request not supported on /favorites/${req.params.campsiteId}`
      );
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorites.findByIdAndDelete(req.params.favoritesId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
