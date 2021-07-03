import * as React from "react"
import { StaticQuery, graphql } from "gatsby"
import { IntlProvider } from "react-intl"
import Header from "./header"
import Sidebar from "./sidebar"
import Footer from "./footer"
import { addSlash, getLanguageInfo } from "../utils"
import i18nMessages from "../data/messages"

const Layout = ({ metadata, page, children, location }) => {
  return (
    <StaticQuery query={graphql`
      query {
        site {
          siteMetadata {
            languages {
              defaultLangKey
              langs
            }
          }
        }
      }
    `} render={data => {
      const { langs, defaultLangKey } = data.site.siteMetadata.languages
      const langInfo = getLanguageInfo(defaultLangKey, langs)(addSlash(location.pathname))
      return (
        <IntlProvider locale={langInfo.langKey} messages={i18nMessages[langInfo.langKey]}>
          <main className="layout">
            <Header location={location} site={metadata.site} languages={data.site.siteMetadata.languages}/>
            <div className="initial-content">
              <div id="main">
                <Sidebar author={metadata.author}/>
                <article className="page" itemScope itemType="http://schema.org/CreativeWork">
                  <meta itemProp="headline" content={page.headline}/>
                  <meta itemProp="description" content={page.description}/>
                  <meta itemProp="datePublished" content="todo"/>
                  <meta itemProp="dateModified" content="todo"/>
                  <div className="page__inner-wrap">
                    {children}
                  </div>
                </article>
              </div>
            </div>
            <div className="page__footer">
              <footer>
                <Footer site={metadata.site} author={metadata.author}/>
              </footer>
            </div>
          </main>
        </IntlProvider>
      )
    }}
    />
  )
}

export default Layout
