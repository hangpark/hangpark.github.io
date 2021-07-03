import ko from "./ko.yaml"
import en from "./en.yaml"

function convert(dict) {
  return Object.fromEntries(Object.entries(dict).reduce(reduceToPath, []))
}

function reduceToPath(acc, [k, v]) {
  if (typeof v !== "object") {
    return [...acc, [k, v]]
  }
  return [
    ...acc,
    ...Object.entries(v).reduce(reduceToPath, []).map(([ck, v]) => [`${k}.${ck}`, v]),
  ]
}

const i18nMessages = {
  ko: convert(ko),
  en: convert(en),
}

export default i18nMessages
