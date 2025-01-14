import vine from '@vinejs/vine'

export const registerUserValidator = vine.compile(
  vine.object({
    username: vine
      .string()
      .trim()
      .minLength(6)
      .alphaNumeric()
      .unique(async (db, value) => {
        const users = await db.from('users').where({ username: value }).first()
        return !users
      }),

    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value) => {
        const users = await db.from('users').where({ email: value }).first()
        return !users
      }),
    password: vine.string().minLength(8),
    thumbail: vine.file({ extnames: ['jpg', 'jpeg', 'png'], size: '10mb' }).optional(),
  })
)

export const LoginUserValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().minLength(8),
  })
)
