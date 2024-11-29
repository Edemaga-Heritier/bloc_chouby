/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const SocialsController = () => import('#controllers/socials_controller')

router.on('/').render('pages/home').as('home')

router.get('/register', [AuthController, 'register']).as('auth.register').use(middleware.guest())
router.post('/register', [AuthController, 'handleRegister']).use(middleware.guest())

router.get('/login', [AuthController, 'login']).as('auth.login').use(middleware.guest())
router.post('/login', [AuthController, 'handleLogin']).use(middleware.guest())

router.delete('/login', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())

router
  .get('/github/redirect', [SocialsController, 'githubRedirect'])
  .as('github.redirect')
  .use(middleware.guest())

router
  .get('/github/callback', [SocialsController, 'githubCallback'])
  .as('github.callback')
  .use(middleware.guest())

router
  .get('/google/redirect', [SocialsController, 'googleRedirect'])
  .as('google.redirect')
  .use(middleware.guest())

router
  .get('/google/callback', [SocialsController, 'googleCallback'])
  .as('google.callback')
  .use(middleware.guest())
