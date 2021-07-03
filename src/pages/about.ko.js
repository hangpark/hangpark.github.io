import * as React from "react"
import Layout from "../components/layout"

const AboutPage = ({ location, pageContext }) => {
  const page = {
    headline: 'About Me',
    description: 'About Me',
  }
  return (
    <Layout location={location} metadata={pageContext.metadata} page={page}>
      <div id="resume">
        <section id="tb">
          <hr/>
          <p className="lead text-center">About Me</p>
        </section>
      </div>
    </Layout>
  )
}

export default AboutPage
