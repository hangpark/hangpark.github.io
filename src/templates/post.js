import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

const Post = ({ location, pageContext, data }) => {
  const post = data.markdownRemark
  const page = {
    headline: post.frontmatter.title,
    description: post.excerpt,
  }
  return (
    <Layout location={location} metadata={pageContext.metadata} page={page}>
      <article className="page" itemScope itemType="http://schema.org/CreativeWork">
        <meta itemProp="headline" content={post.frontmatter.title}/>
        <meta itemProp="description" content={post.excerpt}/>
        <meta itemProp="datePublished" content="todo"/>
        <meta itemProp="dateModified" content="todo"/>
        <div className="page__inner-wrap">
          <header>
            <h1 className="page__title" itemProp="headline">{post.frontmatter.title}</h1>
            <p className="page__meta"><i className="far fa-clock" aria-hidden="true"></i>read-time.html TODO</p>
          </header>
          <section className="page__content" itemProp="text" dangerouslySetInnerHTML={{ __html: post.html }}/>
          {/*<footer className="page__meta">*/}
          {/*  {% if site.data.ui-text[site.locale].meta_label %}*/}
          {/*  <h4 className="page__meta-title">{{ site.data.ui - text[site.locale].meta_label }}</h4>*/}
          {/*  {% endif %}*/}
          {/*  {% include page__taxonomy.html %}*/}
          {/*  {% if page.last_modified_at %}*/}
          {/*  <p className="page__date"><strong><i className="fas fa-fw fa-calendar-alt" aria-hidden="true"></i> {{*/}
          {/*    site*/}
          {/*    .data.ui - text[site.locale].date_label |*/}
          {/*    default: "Updated:"*/}
          {/*  }}</strong>*/}
          {/*    <time dateTime="{{ page.last_modified_at | date: "*/}
          {/*    %Y-%m-%d" }}">{{ page.last_modified_at | date: "%Y-%m-%d"}}</time>*/}
          {/*  </p>*/}
          {/*  {% elsif page.date %}*/}
          {/*  <p className="page__date"><strong><i className="fas fa-fw fa-calendar-alt" aria-hidden="true"></i> {{*/}
          {/*    site*/}
          {/*    .data.ui - text[site.locale].date_label |*/}
          {/*    default: "Updated:"*/}
          {/*  }}</strong>*/}
          {/*    <time dateTime="{{ page.date | date_to_xmlschema }}">{{ page.date | date: "%Y-%m-%d"}}</time>*/}
          {/*  </p>*/}
          {/*  {% endif %}*/}
          {/*</footer>*/}

          {/*{% if page.share %}{% include social-share.html %}{% endif %}*/}

          {/*{% include post_pagination.html %}*/}
        </div>
        {/*{% include comments.html %}*/}
      </article>
    </Layout>
  )
}

export default Post

export const query = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      frontmatter {
        title
      }
      excerpt
      html
    }
  }
`