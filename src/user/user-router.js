const path = require('path')
const express = require('express')
const UserService = require('./user-service')
const AuthService = require('../auth/auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const userRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
  user_id: user.user_id,
  username: user.username,
  password: user.password,
})

userRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    res.json(req.user)
  })
  .delete(requireAuth, (req, res, next) => {
    UserService.deleteUser(
      req.app.get('db'),
      req.user.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { username, password } = req.body
    const newUser = { username, password }

    for (const [key, value] of Object.entries(newUser))
      if (value == null)
        return res.status(400).json({
          error: `missing '${key}' in request body`
        })

    const passwordError = UserService.validatePassword(password)

    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UserService.hasUserWithUsername(
      req.app.get('db'),
      username
    )
      .then(hasUserWithUsername => {
        if (hasUserWithUsername)
          return res.status(400).json({ error: `username already taken` })

        return UserService.hashPassword(password)
          .then(hashedPassword => {
            newUser.password = hashedPassword

            return UserService.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                const sub = user.username
                const payload = { user_id: user.user_id }
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/${user.user_id}`))
                  .json(
                    { authToken: AuthService.createJwt(sub, payload),
                      user: serializeUser(user)
                    })
              })
          })
      })
      .catch(next)
  })


userRouter
  .route('/:user_id')
  .all(requireAuth)
  .all((req, res, next) => {
    UserService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: `user doesn't exist`
          })
        }
        res.user = user
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user))
  })
  .delete((req, res, next) => {
    UserService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { currentUser } = req.body
    const userToUpdate = { 
        username: currentUser.username.value, 
        password: currentUser.password.value, 
    }
    const numberOfValues = Object.values(userToUpdate).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: `request body must contain data`
      })

    UserService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = userRouter