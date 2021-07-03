import * as React from "react"
import { Link as GatsbyLink } from "gatsby"
import { addSlash, getLanguageInfo } from "../utils"

function getUrlForLang(url, langKey, defaultLangKey) {
  return url.replace('/', `/${langKey}/`).replace(`/${defaultLangKey}/`, '/')
}

const Link = ({ to, location, languages, children, langKey, className }) => {
  const { langs, defaultLangKey } = languages
  const langInfo = getLanguageInfo(defaultLangKey, langs)(addSlash(location.pathname))
  if (!langKey) {
    langKey = langInfo.langKey
  }
  const urlForLang = getUrlForLang(addSlash(to), langKey, defaultLangKey)
  return (
    <GatsbyLink to={urlForLang} className={className}>{children}</GatsbyLink>
  )
}

export default Link