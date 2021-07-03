import * as React from "react"
import { FaGithub } from "react-icons/fa"
import { FormattedMessage as T } from "react-intl"

const Footer = ({ site, author }) => {
  const year = new Date().getFullYear()
  return (
    <>
      <div className="page__footer-follow">
        <ul className="social-icons">
          <li><strong><T id="layout.follow"/>: </strong></li>
          <li>
            <a href={`https://github.com/${author.github}`} itemProp="sameAs">
              <FaGithub className="svg-inline--fa fa-fw fa-github"/> GitHub
            </a>
          </li>
          <li><a href="feed"><i className="fas fa-fw fa-rss-square" aria-hidden="true"></i>Feed</a></li>
        </ul>
      </div>
      <div className="page__footer-copyright">&copy; {year} {site.name}. All rights reserved.</div>
    </>
  )
}

export default Footer