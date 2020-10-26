import { graphql } from 'gatsby'
import React from 'react'
import Cart from '../components/cart'
import Layout from '../components/layout'
import Page from '../components/page'

const IndexPage = ({ data }) => {
  const { products } = data.allProductsYaml.nodes[0]
  return (
    <Layout>
      <Page products={products} />
      <Cart />
    </Layout>
  )
}

export default IndexPage

export const PRODUCTS_QUERY = graphql`
  query PRODUCTS_QUERY {
    allProductsYaml {
      nodes {
        products: variants {
          id
          name
          price
        }
      }
    }
  }
`
