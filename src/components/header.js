import * as React from "react"
import { FormattedMessage as T } from "react-intl"
import { IoLanguageOutline } from "react-icons/io5"
import Link from "./link"
import { addSlash, getLanguageInfo } from "../utils"

const Header = ({ location, site, languages }) => {
  const { langs, defaultLangKey } = languages
  const langInfo = getLanguageInfo(defaultLangKey, langs)(addSlash(location.pathname))
  const langMenus = langs.map(l => ({ langKey: l, selected: langInfo.langKey === l }))
  return (
    <div className="masthead">
      <div className="masthead__inner-wrap">
        <div className="masthead__menu">
          <nav id="site-nav" className="greedy-nav">
            <Link className="site-title" location={location} languages={languages} to="/">{site.name}</Link>
            <ul className="visible-links">
              <li className="masthead__menu-item">
                <Link location={location} languages={languages} to="/about"><T id="menus.about"/></Link>
              </li>
              {langMenus.filter(elem => !elem.selected).map(elem => (
                <li key={elem.langKey} className="masthead__menu-item">
                  <Link location={location} languages={languages} to={langInfo.baseSlug} langKey={elem.langKey}><IoLanguageOutline className="svg-inline--fa"/> <T id={`language.${elem.langKey}`}/></Link>
                </li>
              ))}
            </ul>
            <button className="search__toggle" type="button">
              <svg className="icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.99 16">
                <path
                  d="M15.5,13.12L13.19,10.8a1.69,1.69,0,0,0-1.28-.55l-0.06-.06A6.5,6.5,0,0,0,5.77,0,6.5,6.5,0,0,0,2.46,11.59a6.47,6.47,0,0,0,7.74.26l0.05,0.05a1.65,1.65,0,0,0,.5,1.24l2.38,2.38A1.68,1.68,0,0,0,15.5,13.12ZM6.4,2A4.41,4.41,0,1,1,2,6.4,4.43,4.43,0,0,1,6.4,2Z"
                  transform="translate(-.01)"></path>
              </svg>
            </button>
            <button className="greedy-nav__toggle hidden" type="button">
              <span className="visually-hidden">Toggle Menu (TODO)</span>
              <div className="navicon"></div>
            </button>
            <ul className="hidden-links hidden"></ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Header