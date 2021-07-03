import { compose, curry, endsWith, startsWith } from "ramda"

function addSlashStart(fileName) {
  return startsWith("/", fileName) ? fileName : "/" + fileName
}

function addSlashEnd(fileName) {
  return endsWith("/", fileName) ? fileName : fileName + "/"
}

export const addSlash = compose(addSlashStart, addSlashEnd)

export const getLanguageInfo = curry((defaultLangKey, langs, url) => {
  const info = langs
    .filter(l => l !== defaultLangKey)
    .map(l => ({ langKey: l, prefix: `/${l}/` }))
    .find(({ prefix }) => startsWith(prefix, url))
  if (!info) {
    return {
      langKey: defaultLangKey,
      baseSlug: url,
    }
  }
  return {
    langKey: info.langKey,
    baseSlug: url.replace(info.prefix, "/"),
  }
})