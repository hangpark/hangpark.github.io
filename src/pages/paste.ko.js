import * as React from "react"
import Layout from "../components/layout"
import pako from "pako"
import { Base64 } from 'js-base64'

const AboutPage = ({ location, pageContext }) => {
  const page = {
    headline: 'About Me',
    description: 'About Me',
  }
  const enc = new TextEncoder()
  const dec = new TextDecoder('utf-8')
  console.log("text length", text.length)
  const encoded = enc.encode(text)
  console.log("encoded uint8[]", encoded)
  try {
    const defres = pako.deflate(encoded, { level: 9 })
    console.log("deflate result", defres)
    const infres2 = pako.inflate(defres, {level:9})
    console.log(dec.decode(infres2))
    const b64 = Base64.fromUint8Array(defres, true)
    console.log("compressed b64", b64.length, b64)

    const infres = pako.inflate(Base64.toUint8Array(b64), { level: 9 })
    console.log("inflate result", infres)
    const decoded = dec.decode(infres)
    console.log("decoded", decoded)
  } catch (e) {
    console.error(e)
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
