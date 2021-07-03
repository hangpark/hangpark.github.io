import * as React from "react"
import {
  FaMapMarkerAlt,
  FaEnvelopeSquare,
  FaKey,
  FaTwitterSquare,
  FaFacebookSquare,
  FaLinkedin,
  FaInstagram,
  FaGithub,
} from "react-icons/fa"
import { FormattedMessage as T } from "react-intl"
import bioPhoto from "../images/bio-photo.jpg"

class Sidebar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showAuthor: false,
    }
  }
  render() {
    const { author } = this.props
    return (
      <div className="sidebar sticky">
        <div itemScope itemType="http://schema.org/Person">
          <div className="author__avatar">
            <img src={bioPhoto} alt={author.name} itemProp="image"/>
          </div>
          <div className="author__content">
            <h3 className="author__name" itemProp="name">{author.name}</h3>
            <p className="author__bio" itemProp="description">
              {author.bio}
            </p>
          </div>
          <div className="author__urls-wrapper">
            <button className={`btn btn--inverse ${this.state.showAuthor ? "open" : ""}`} onClick={() => {
              this.setState({showAuthor: !this.state.showAuthor})
            }}><T id="layout.follow"/></button>
            <ul className={`author__urls social-icons ${this.state.showAuthor ? "is--visible" : ""}`}>
              {author.location && (
                <li itemProp="homeLocation" itemScope itemType="http://schema.org/Place">
                  <FaMapMarkerAlt className="svg-inline--fa fa-fw fa-map-marker-alt"/> <span itemProp="name">{author.location}</span>
                </li>
              )}
              {author.email && (
                <li>
                  <a href={`mailto:${author.email}`}>
                    <meta itemProp="email" content={author.email}/>
                    <FaEnvelopeSquare className="svg-inline--fa fa-fw fa-envelope-square"/> {author.email}
                  </a>
                </li>
              )}
              {author.github && (
                <li>
                  <a href={`https://github.com/${author.github}`} itemProp="sameAs">
                    <FaGithub className="svg-inline--fa fa-fw fa-github"/> GitHub
                  </a>
                </li>
              )}
              {author.keybase && (
                <li>
                  <a href={`https://keybase.io/${author.keybase}`} itemProp="sameAs">
                    <FaKey className="svg-inline--fa fa-fw fa-key"/> Keybase
                  </a>
                </li>
              )}
              {author.facebook && (
                <li>
                  <a href={`https://www.facebook.com/${author.facebook}`} itemProp="sameAs">
                    <FaFacebookSquare className="svg-inline--fa fa-fw fa-facebook"/> Facebook
                  </a>
                </li>
              )}
              {author.instagram && (
                <li>
                  <a href={`https://instagram.com/${author.instagram}`} itemProp="sameAs">
                    <FaInstagram className="svg-inline--fa fa-fw fa-instagram"/> Instagram
                  </a>
                </li>
              )}
              {author.twitter && (
                <li>
                  <a href={`https://twitter.com/${author.twitter}`} itemProp="sameAs">
                    <FaTwitterSquare className="svg-inline--fa fa-fw fa-twitter-squre"/> Twitter
                  </a>
                </li>
              )}
              {author.linkedin && (
                <li>
                  <a href={`https://www.linkedin.com/in/${author.linkedin}`} itemProp="sameAs">
                    <FaLinkedin className="svg-inline--fa fa-fw fa-linkedin"/> LinkedIn
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default Sidebar