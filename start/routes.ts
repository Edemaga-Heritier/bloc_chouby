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
const PostController = () => import('#controllers/post_controller')
const SocialsController = () => import('#controllers/socials_controller')

router.get('/', [PostController, 'index']).as('home')

router.get('/register', [AuthController, 'register']).as('auth.register').use(middleware.guest())
router.post('/register', [AuthController, 'handleRegister']).use(middleware.guest())

router.get('/login', [AuthController, 'handleLogin']).as('auth.login').use(middleware.guest())
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

router.get('/post/create', [PostController, 'create']).as('post.create').use(middleware.auth())
router.post('/post/create', [PostController, 'store']).use(middleware.auth())

router
  .get('/posts/:slug/:id', [PostController, 'show'])
  .as('post.show')
  .where('slug', router.matchers.slug())
  .where('id', router.matchers.number())

router
  .get('/posts/:id/edit', [PostController, 'edit'])
  .as('post.edit')
  .where('id', router.matchers.number())
  .use(middleware.auth())

router
  .put('/posts/:id/edit', [PostController, 'update'])
  .as('post.update')
  .where('id', router.matchers.number())
  .use(middleware.auth())
