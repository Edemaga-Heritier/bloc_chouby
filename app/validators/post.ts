import vine from '@vinejs/vine'

export const storePostValidator = vine.compile(
  vine.object({
    title: vine.string().unique(async (db, value) => {
      const post = await db.from('posts').where('title', value).first()
      return !post
    }),
    thumbail: vine.file({ extnames: ['jpg', 'jpeg', 'png'], size: '10mb' }).optional(),
    content: vine.string(),
  })
)