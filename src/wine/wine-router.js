const path = require('path')
const express = require('express')
const wineService = require('./wine-service')
const { requireAuth } = require('../middleware/jwt-auth')

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
  userId: wine.user_id,
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
    const { wine } = req.body
    const newWine = { wine }

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
          .json(serializeWine(wine))
      })
      .catch(next)
  })

module.exports = wineRouter