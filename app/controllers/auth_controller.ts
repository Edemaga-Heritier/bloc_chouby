import User from '#models/user'
import { LoginUserValidator, registerUserValidator } from '#validators/auth'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

import { toPng } from 'jdenticon'
import { writeFile } from 'node:fs/promises'

export default class AuthController {
  register({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async handleRegister({ request, session, response }: HttpContext) {
    const { username, email, password, thumbail } =
      await request.validateUsing(registerUserValidator)
    if (!thumbail) {
      const png = toPng(username, 100)
      await writeFile(`public/users/${username}.png`, png)
    } else {
      await thumbail.move(app.makePath('public/users'), { name: `${cuid()}.${thumbail.extname}` })
    }
    const filePath = `users/${thumbail?.fileName || username + '.png'}`

    await User.create({ username, email, thumbail: filePath, password })
    session.flash('success', 'inscription reussie')
    return response.redirect().toRoute('auth.login')
  }

  async login({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }
  async handleLogin({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(LoginUserValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      session.flash('success', 'Connexion réussie')
      return response.redirect().toRoute('home')
    } catch (error) {
      session.flash('error', 'Identifiants invalides')
      return response.redirect().back()
    }
  }

  async logout({ auth, response, session }: HttpContext) {
    auth.use('web').logout()
    session.flash('success', 'deconnexion reussie')
    return response.redirect().toRoute('auth.login')
  }
}
