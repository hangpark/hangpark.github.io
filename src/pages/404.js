import * as React from "react"
import { Link as GatsbyLink, graphql } from "gatsby"
import { IntlProvider, FormattedMessage as T } from "react-intl"
import Layout from "../components/layout"
import Link from "../components/link"
import TitleBar from "../components/title-bar"
import i18nMessages from "../data/messages"
import { addSlash, getLanguageInfo } from "../utils"

const NotFoundPage = ({ location, pageContext, data }) => {
  const { defaultLangKey, langs } = data.site.siteMetadata.languages
  const langInfo = getLanguageInfo(defaultLangKey, langs)(addSlash(location.pathname))
  const translatedPages = data.allSitePage.edges.filter(({ node }) => {
    return node.context.baseSlug === langInfo.baseSlug && node.context.langKey !== langInfo.langKey
  }).map(({ node }) => ({ path: node.path, langKey: node.context.langKey }))
  const page = {
    headline: "Not Found",
    description: "404 Page Not Found",
  }
  return (
    <Layout location={location} metadata={pageContext.metadata} page={page}>
      <IntlProvider locale={langInfo.langKey} messages={i18nMessages[langInfo.langKey]}>
        <header style={{ marginTop: "2em" }}>
          <TitleBar/>
          <h1 className="page__title" itemProp="headline"><T id="404.title"/></h1>
        </header>
        <section className="page__content" style={{ marginTop: "2em" }}>
          <p>
            <Link to="/" languages={data.site.siteMetadata.languages} langKey={langInfo.langKey} location={location}>
              <T id="404.goHome"/>
            </Link>
          </p>
          {translatedPages.length && (
            <>
              <p><T id="404.notTranslated"/></p>
              <p><T id="404.suggestTranslations"/></p>
            </>
          )}
          {translatedPages.map(({ path, langKey }) => (
            <GatsbyLink className="btn btn--inline btn--info btn--large" style={{ marginRight: '0.5em' }} key={langKey} to={path}><T id={`language.${langKey}`}/></GatsbyLink>
          ))}
        </section>
      </IntlProvider>
    </Layout>
  )
}

export default NotFoundPage

export const query = graphql`
query {
  site {
    siteMetadata {
      languages {
        defaultLangKey
        langs
      }
    }
  }
  allSitePage {
    edges {
      node {
        path
        context {
          langKey
          baseSlug
        }
      }
    }
  }
}
`
