import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
// import { userInfo } from 'node:os'

export default class SocialsController {
  async githubRedirect({ ally }: HttpContext) {
    ally.use('github').redirect((req) => {
      //+
      req.scopes(['user']) //+
    }) //+
  }
  async githubCallback({ ally, response, session, auth }: HttpContext) {
    const gh = ally.use('github')

    if (gh.accessDenied()) {
      session.flash('success', 'Tu as annuler')
      return response.redirect().toRoute('auth.login')
    }

    if (gh.stateMisMatch()) {
      session.flash('success', 'Erreur de connexion')
      return response.redirect().toRoute('auth.login')
    }

    if (gh.hasError()) {
      session.flash('success', 'Erreur de connexion')
      return response.redirect().toRoute('auth.login')
    }

    const githubUser = await gh.user()
    const users = await User.findBy('email', githubUser.email)
    if (!users) {
      const newUser = await User.create({
        username: githubUser.name,
        email: githubUser.email,
        thumbail: githubUser.avatarUrl,
      })
      await auth.use('web').login(newUser)
    }
    await auth.use('web').login(users!)
    session.flash('success', 'Vous etes connecte')
    return response.redirect().toRoute('auth.login')
  }
}
