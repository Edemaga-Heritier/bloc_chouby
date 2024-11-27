import User from '#models/user'
import { registerUserValidator } from '#validators/auth'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

export default class AuthController {
  register({ view }: HttpContext) {
    return view.render('pages/auth/register')
  }

  async handleRegister({ request, session, response }: HttpContext) {
    const { username, email, password, thumbail } =
      await request.validateUsing(registerUserValidator)
    if (!thumbail) {
    } else {
      await thumbail.move(app.makePath('public/users'), { name: `${cuid()}.${thumbail.extname}` })
    }
    const filePath = `users/${thumbail?.fileName}`
    await User.create({ username, email, thumbail: filePath, password })
    session.flash('success', 'User created successfully')
    return response.redirect('/home')
  }
  login({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }
}
