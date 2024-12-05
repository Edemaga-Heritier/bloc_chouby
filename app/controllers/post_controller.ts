import Post from '#models/post'
import { FileUploaderService } from '#services/file_uploader_service'
import { storePostValidator } from '#validators/post'
import { inject } from '@adonisjs/core'
import stringHelpers from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class PostController {
  constructor(private readonly fileUploaderService: FileUploaderService) {}

  async index({ view, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 2
    const posts = await Post.query()
      .select('id', 'title', 'content', 'slug', 'thumbail', 'user_id')
      .preload('user', (u) => u.select('username'))
      .paginate(page, limit)
    // .orderBy('created_at', 'desc')

    return view.render('pages/home', { posts })
  }

  /**
   * Display form to create a new record
   */
  async create({ view }: HttpContext) {
    return view.render('pages/post/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response, session }: HttpContext) {
    const { content, title, thumbail } = await request.validateUsing(storePostValidator)
    const slug = stringHelpers.slug(title).toLocaleLowerCase()
    const filePath = await this.fileUploaderService.upload(thumbail, slug, '', 'posts')
    await Post.create({
      title,
      content,
      slug,
      thumbail: filePath,
      userId: auth.user!.id,
    })
    session.flash('success', 'Votre article e bien été publie')
    return response.redirect().toRoute('home')
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}
