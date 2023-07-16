import {readFile, writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {promisify} from 'node:util'
import {gzip} from 'node:zlib'

import PackageJson from '@npmcli/package-json'
import {Marked} from 'marked'
import markedMan from 'marked-man'

import getPackageJsonBinFilenames from './getPackageJsonBinFilenames.js'


const promisifiedGzip = promisify(gzip)


async function generateManPage(fileArg)
{
  const data = await readFile(fileArg, 'utf8')

  return new Marked(markedMan, {async: true, fileArg, gfm: true})
    .parse(data)
    .then(promisifiedGzip)
}


export default async function(path = '.')
{
  const packageJson = await PackageJson.load(path)

  const {content} = packageJson

  if(content.man?.length) return

  const {size} = await getPackageJsonBinFilenames(content)

  let man

  switch(size)
  {
    case 0:
      return

    case 1:
    {
      man = 'man.1.gz'

      const data = await generateManPage(resolve(path, 'README.md'))

      await writeFile(resolve(path, man), data)

      break
    }

    // TODO: add support for multiple binaries, both one or multiple man pages
    // default:
    // {
    //   await Promise.all([...binaryNames].map(generateManPage))

    //   man = [...binaryNames].map(basename).map(join.bind(null, 'man.1'))
    // }
  }

  if(man) await packageJson.update({man}).save()
}
