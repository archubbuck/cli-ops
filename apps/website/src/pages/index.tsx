import type React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '../components/HomepageFeatures'
import Heading from '@theme/Heading'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/guides/quick-start">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/contributing/plugin-development"
            style={{ marginLeft: '1rem' }}
          >
            Build a Plugin
          </Link>
        </div>
        <div className={styles.codeExample}>
          <pre>
            <code>
              {`# Install clio
npm install -g @cli-ops/clio

# Use built-in task management
clio tasks:create "Learn Clio"

# Install plugins for more features
clio plugins:install @cli-ops/clio-plugin-fetch`}
            </code>
          </pre>
        </div>
      </div>
    </header>
  )
}

export default function Home(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title} - Plugin-first CLI Framework`}
      description="Build extensible command-line tools with Clio's plugin architecture"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
