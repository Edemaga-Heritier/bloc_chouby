import User from '#models/user'
import { LoginUserValidator, registerUserValidator } from '#validators/auth'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
// eslint-disable-next-line @unicorn/prefer-node-protocol
import { writeFile } from 'fs'

import { toPng } from 'jdenticon'

export default class AuthController {
  register({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async handleRegister({ request, session, response }: HttpContext) {
    const { username, email, password, thumbail } =
      await request.validateUsing(registerUserValidator)
    if (!thumbail) {
      const png = toPng(username, 100)

      // writeFile(`public/users/${username}.png`, png)//-
      writeFile(`public/users/${username}.png`, png, (err: any) => {
        if (err) {
          console.error('Error writing file:', err)
        }
      })
    } else {
      await thumbail.move(app.makePath('public/users'), { name: `${cuid()}.${thumbail.extname}` })
    }
    const filePath = `users/${thumbail?.fileName || username + '.png'}`
    await User.create({ username, email, thumbail: filePath, password })
    session.flash('success', 'User created successfully')
    return response.redirect().toRoute('auth.login')
  }

  login({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }
  // eslint-disable-next-line @typescript-eslint/no-shadow
  async handleLogin({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(LoginUserValidator)
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    session.flash('success', 'connexion reussie')
    return response.redirect().toRoute('home')
  }

  async logout({ auth, response, session }: HttpContext) {
    auth.use('web').logout()
    session.flash('success', 'deconnexion reussie')
    return response.redirect().toRoute('auth.login')
  }
}
