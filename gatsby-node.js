const fs = require(`fs`)
const yaml = require(`js-yaml`)
const _ = require(`lodash`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const relativeFilePath = createFilePath({
      node,
      getNode,
      basePath: `posts`,
    })
    createNodeField({
      node,
      name: `slug`,
      value: `${relativeFilePath}`,
    })
  }
}

exports.createPages = async function({ actions, graphql }) {
  const { data } = await graphql(`
      query {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
  `)
  data.allMarkdownRemark.edges.forEach(edge => {
    const slug = edge.node.fields.slug
    const langKey = edge.node.fields.langKey || 'ko'
    const baseSlug = slug.replace(`/${langKey}/`, "/")
    actions.createPage({
      path: slug,
      component: require.resolve(`./src/templates/post.js`),
      context: { slug, langKey, baseSlug },
    })
  })
}

exports.onCreatePage = ({ page, actions }) => {
  const slug = page.context.slug || page.path
  const langKey = page.context.langKey || 'ko'
  const baseSlug = slug.replace(`/${langKey}/`, "/")
  const { createPage, deletePage } = actions
  deletePage(page)
  createPage({
    ...page,
    context: {
      ...page.context,
      slug,
      langKey,
      baseSlug,
      metadata: getMetadata(langKey),
    },
  })
}

const metadataCache = {}

function getMetadata(langKey) {
  if (!metadataCache[langKey]) {
    if (langKey === 'ko') {
      metadataCache[langKey] = yaml.load(fs.readFileSync(`./metadata.yaml`, `utf-8`))
    } else {
      const metadata = yaml.load(fs.readFileSync(`./metadata.${langKey}.yaml`, `utf-8`))
      const baseMetadata = getMetadata('ko')
      metadataCache[langKey] = _.merge({}, baseMetadata, metadata)
    }
  }
  return metadataCache[langKey]
}