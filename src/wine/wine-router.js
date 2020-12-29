const path = require('path')
const express = require('express')
const wineService = require('./wine-service')
const { requireAuth } = require('../middleware/jwt-auth')
const { searchWine } = require('./wine-service')

const wineRouter = express.Router()
const jsonParser = express.json()

const serializeWine = wine => ({
  winemaker: wine.winemaker,
  wine_type: wine.wine_type,
  wine_name: wine.wine_name,
  varietal: wine.varietal,
  vintage: wine.vintage,
  region: wine.region,
  tasting_notes: wine.tasting_notes,
  rating: wine.rating,
  img_url: wine.img_url,
  user_id: wine.user_id,
  wine_id: wine.wine_id,
})
wineRouter
.get('/search', (req, res, next) => {
  /*let response = wine;
  if (req.query.wine_type) {
    response = response.filter(wine =>
      wine.wine_type.toLowerCase().includes(req.query.wine_type.toLowerCase())
    )
  }
  if (req.query.winemaker) {
    response = response.filter(wine =>
      wine.winemaker.toLowerCase().includes(req.query.winemaker.toLowerCase())
    )
  }
  if (req.query.wine_name) {
    response = response.filter(wine =>
      wine.wine_name.toLowerCase().includes(req.query.wine_name.toLowerCase())
    )
  }
  if (req.query.varietal) {
    response = response.filter(wine =>
      wine.varietal.toLowerCase().includes(req.query.varietal.toLowerCase())
    )
  }
  if (req.query.vintage) {
    response = response.filter(wine =>
      wine.vintage.toLowerCase().includes(req.query.vintage.toLowerCase())
    )
  }
  if (req.query.region) {
    response = response.filter(wine =>
      wine.region.toLowerCase().includes(req.query.region.toLowerCase())
    )
  }
  if (req.query.tasting_notes) {
    response = response.filter(wine =>
      wine.tasting_notes.toLowerCase().includes(req.query.tasting_notes.toLowerCase())
    )
  }
  if (req.query.rating) {
    response = response.filter(wine =>
      Number(wine.rating) >= Number(req.query.rating)
    )
  }*/
  const knexInstance = req.app.get('db');
  wineService.searchWine(knexInstance, req.params.searchTerm)
    .then(wine => {
      res.json(wine.map(serializeWine))
    })
    .catch(next)
})
wineRouter
  .route('/:user_id')
  .all(requireAuth)
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    wineService.getAllWine(knexInstance, req.params.user_id)
      .then(wine => {
        res.json(wine.map(serializeWine))
      })
      .catch(next)
  })
  .post(requireAuth, jsonParser, (req, res, next) => {
    const { winemaker, wine_type, wine_name, varietal, region, tasting_notes, rating, img_url } = req.body
    const newWine = { winemaker, wine_type, wine_name, varietal, region, tasting_notes, rating, img_url }

    for (const [key, value] of Object.entries(newWine))
      if (value == null)
        return res.status(400).json({
          error: { message: `missing '${key}' in request body` }
        })

    newWine.user_id = req.user.user_id;

    wineService.insertWine(
      req.app.get('db'),
      newWine
    )
      .then(wine => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${wine.wine_id}`))
          .json(serializeWine(newWine))
      })
      .catch(next)
  })

module.exports = wineRouter