import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Plugin Architecture',
    emoji: '🔌',
    description: (
      <>
        Install only the commands you need. Clio uses oclif's robust plugin
        system to enable modular, extensible CLIs that grow with your needs.
      </>
    ),
  },
  {
    title: 'ADHD/OCD Friendly',
    emoji: '🧠',
    description: (
      <>
        Designed with neurodivergent users in mind. Clear visual hierarchy,
        undo capabilities, and thoughtful UX patterns reduce cognitive load.
      </>
    ),
  },
  {
    title: 'Lightning Fast',
    emoji: '⚡',
    description: (
      <>
        Strict performance budgets ensure commands respond in &lt;200ms.
        Built with modern JavaScript tooling and intelligent caching.
      </>
    ),
  },
  {
    title: 'Command History',
    emoji: '📝',
    description: (
      <>
        Never fear mistakes. Clio tracks all commands with full undo/redo
        support for reversible operations.
      </>
    ),
  },
  {
    title: 'TypeScript First',
    emoji: '🔷',
    description: (
      <>
        Full TypeScript support with strict mode enabled. Shared packages
        provide type-safe utilities for logging, config, and more.
      </>
    ),
  },
  {
    title: 'Monorepo Friendly',
    emoji: '📦',
    description: (
      <>
        Built with Turborepo and pnpm workspaces. CI/CD ready with automated
        testing, versioning, and publishing via Changesets.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <div className={styles.featureEmoji}>{emoji}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
