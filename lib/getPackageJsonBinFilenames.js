import {readdir} from 'node:fs/promises'


export default async function getPackageJsonBinFilenames(
  {bin, directories: {bin: directoriesBin} = {}}
) {
  const result = new Set

  const add = result.add.bind(result)

  if(typeof bin === 'string')
    add(bin)

  else if(bin)
    Object.values(bin).forEach(add)

  else if(directoriesBin)
  {
    const files = await readdir(directoriesBin)

    files.forEach(add)
  }

  return result
}
