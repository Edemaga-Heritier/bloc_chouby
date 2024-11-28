import User from '#models/user'
import { LoginUserValidator, registerUserValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  register({ view }: HttpContext) {
    console.log('Rendering registration page')
    return view.render('pages/auth/register')
  }

  async handleRegister({ request, session, response }: HttpContext) {
    console.log('Handling registration request')
    const { username, email, password, thumbail } =
      await request.validateUsing(registerUserValidator)

    console.log('Validated data:', { username, email, password, thumbail })

    const filePath = `users/${thumbail?.fileName || username + '.png'}`
    console.log('File path for thumbnail:', filePath)

    const newUser = await User.create({ username, email, thumbail: filePath, password })
    console.log('User created:', newUser)

    session.flash('success', 'User created successfully')
    return response.redirect().toRoute('auth.login')
  }

  login({ view }: HttpContext) {
    console.log('Rendering login page')
    return view.render('pages/auth/login')
  }

  async handleLogin({ request, auth, response, session }: HttpContext) {
    console.log('Handling login request')
    const { email, password } = await request.validateUsing(LoginUserValidator)

    console.log('Login data:', { email, password })

    const user = await User.verifyCredentials(email, password)
    console.log('Verified user:', user)

    await auth.use('web').login(user)
    console.log('User logged in')

    session.flash('success', 'Connexion réussie')
    return response.redirect().toRoute('home')
  }

  async logout({ auth, response, session }: HttpContext) {
    console.log('Handling logout request')
    auth.use('web').logout()
    console.log('User logged out')

    session.flash('success', 'Déconnexion réussie')
    return response.redirect().toRoute('auth.login')
  }
}
