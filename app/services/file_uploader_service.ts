import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
//import { writeFile } from 'node:fs/promises'
import { toPng } from 'jdenticon'


export class FileUploaderService {
  async upload(thumbail: MultipartFile | undefined, identiconName: string, path: string) {
    if (!thumbail) {
      const png = toPng(identiconName, 100)
      // await writeFile(`public/${path}/${identiconName}.png`, png)
    } else {
      await thumbail.move(app.makePath(`public/${path}`), { name: `${cuid()}.${thumbail.extname}` })
    }
    return `${path}/${thumbail?.fileName || identiconName + '.png'}`
  }
}
