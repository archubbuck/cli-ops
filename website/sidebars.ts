import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['intro', 'installation', 'quick-start'],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: ['concepts/overview'],
    },
    {
      type: 'category',
      label: 'Plugin Documentation',
      items: ['plugins/getting-started', 'plugins/development', 'plugins/best-practices'],
    },
    {
      type: 'category',
      label: 'Official Plugins',
      items: ['plugins/tasks', 'plugins/fetch', 'plugins/repo'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: ['architecture/overview'],
    },
    {
      type: 'category',
      label: 'Contributing',
      items: ['contributing/getting-started'],
    },
  ],
}

export default sidebars
