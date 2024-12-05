import Post from '#models/post'
import { FileUploaderService } from '#services/file_uploader_service'
import { storePostValidator, updatePostValidator } from '#validators/post'
import { inject } from '@adonisjs/core'
import stringHelpers from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import { unlink } from 'node:fs/promises'
import { marked } from 'marked'

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
  async show({ params, response, view }: HttpContext) {
    const { slug, id } = params
    const post = await Post.findByOrFail('id', id)
    // await posts.load('user')
    const content = marked(post.content)
    if (post.slug !== slug) {
      return response.redirect().toRoute('post.show', { slug: post.slug, id })
    }
    return view.render('pages/post/show', { content, postTitle: post.title })
  }

  /**
   * Edit individual record
   */
  async edit({ params, view }: HttpContext) {
    const { id } = params
    const post = await Post.findByOrFail('id', id)
    return view.render('pages/post/edit', { post })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, session, response }: HttpContext) {
    const { id } = params
    const { content, thumbail, title } = await request.validateUsing(updatePostValidator)
    const post = await Post.findByOrFail('id', id)
    const slug = post.title !== title && stringHelpers.slug(title)
    if (thumbail) {
      await unlink(`public/${post.thumbail}`)
      const filePath = await this.fileUploaderService.upload(thumbail, '', 'posts')
      post.merge({ thumbail: filePath })
    }
    if (slug) post.merge({ title, slug })
    if (post.content !== content) post.merge({ content })
    await post.save()

    session.flash('success', 'Votre article e bien été publie')
    return response.redirect().toRoute('home')
  }

  /**
   * Delete record
   */
  async destroy({ params, session, response }: HttpContext) {
    const { id } = params
    const post = await Post.findByOrFail('id', id)
    await unlink(`public/${post.thumbail}`)
    await post.delete()

    session.flash('success', 'Votre article e bien été supprimé')
    return response.redirect().toRoute('home')
  }
}
