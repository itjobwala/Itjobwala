export const KNOWN_SKILLS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
  'PHP', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB', 'Perl', 'Bash', 'Shell',
  'PowerShell', 'Groovy', 'Elixir', 'Haskell', 'Lua', 'Julia',

  // Frontend
  'React', 'ReactJS', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'AngularJS',
  'Svelte', 'SvelteKit', 'Nuxt.js', 'Remix', 'Gatsby', 'HTML', 'HTML5', 'CSS', 'CSS3',
  'Sass', 'SCSS', 'Less', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'MUI', 'Chakra UI',
  'Ant Design', 'Shadcn', 'Redux', 'Zustand', 'MobX', 'Recoil', 'Jotai', 'React Query',
  'TanStack Query', 'SWR', 'Axios', 'Webpack', 'Vite', 'Rollup', 'Parcel', 'Babel',
  'Three.js', 'D3.js', 'Chart.js', 'Recharts', 'Framer Motion', 'GSAP', 'Storybook',

  // Backend
  'Node.js', 'Express', 'Express.js', 'Fastify', 'NestJS', 'Koa', 'Hapi',
  'Django', 'Flask', 'FastAPI', 'SQLAlchemy',
  'Spring', 'Spring Boot', 'Spring MVC', 'Hibernate', 'Maven', 'Gradle',
  'Ruby on Rails', 'Rails', 'Sinatra',
  'Laravel', 'Symfony', 'CodeIgniter', 'Yii',
  'ASP.NET', 'ASP.NET Core', '.NET', '.NET Core', 'Entity Framework',
  'GraphQL', 'REST', 'REST API', 'gRPC', 'WebSockets', 'tRPC',

  // Databases
  'MySQL', 'PostgreSQL', 'SQLite', 'Oracle', 'SQL Server', 'MariaDB',
  'MongoDB', 'DynamoDB', 'Cassandra', 'CouchDB', 'Firebase', 'Firestore',
  'Redis', 'Memcached', 'Elasticsearch', 'OpenSearch', 'Neo4j', 'InfluxDB',
  'Supabase', 'PlanetScale', 'Prisma', 'Sequelize', 'TypeORM', 'Mongoose',

  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean',
  'Docker', 'Kubernetes', 'Helm', 'Terraform', 'Ansible', 'Puppet', 'Chef',
  'CI/CD', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'CircleCI', 'Travis CI', 'ArgoCD',
  'Nginx', 'Apache', 'Linux', 'Ubuntu', 'Debian', 'CentOS',
  'AWS EC2', 'AWS S3', 'AWS Lambda', 'AWS RDS', 'AWS ECS', 'AWS EKS',
  'AWS CloudFront', 'AWS SQS', 'AWS SNS', 'AWS API Gateway',
  'Pulumi', 'CloudFormation', 'Grafana', 'Prometheus', 'Datadog', 'New Relic',
  'Splunk', 'ELK Stack', 'Kibana', 'Logstash',

  // Testing
  'Jest', 'Vitest', 'Mocha', 'Chai', 'Jasmine', 'Karma',
  'Playwright', 'Cypress', 'Selenium', 'WebdriverIO', 'Puppeteer',
  'Appium', 'Detox', 'Espresso', 'XCTest',
  'JUnit', 'TestNG', 'Mockito', 'PyTest', 'unittest',
  'Testing Library', 'React Testing Library', 'Enzyme',
  'k6', 'JMeter', 'Locust', 'Gatling',
  'Postman', 'Insomnia', 'REST Assured', 'SoapUI',

  // Mobile
  'iOS', 'Android', 'React Native', 'Flutter', 'Ionic', 'Xamarin', 'Cordova',
  'SwiftUI', 'UIKit', 'Jetpack Compose', 'Kotlin Multiplatform',

  // Data & ML
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'SciPy',
  'Matplotlib', 'Seaborn', 'Plotly', 'OpenCV', 'Hugging Face', 'LangChain',
  'Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt', 'Flink',
  'Tableau', 'Power BI', 'Looker', 'Metabase',
  'Data Engineering', 'Data Science', 'Data Analysis', 'ETL',

  // Tools & Practices
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',
  'Jira', 'Confluence', 'Linear', 'Notion', 'Slack',
  'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD', 'DDD', 'OOP',
  'Microservices', 'Serverless', 'Event-Driven', 'SOA',
  'Design Patterns', 'System Design', 'API Design', 'OpenAPI', 'Swagger',
  'OAuth', 'JWT', 'SSO', 'SAML', 'LDAP',
  'WebAssembly', 'PWA', 'SEO', 'Web Performance',
  'Figma', 'Adobe XD',

  // Infra / Security
  'Cybersecurity', 'Penetration Testing', 'OWASP', 'SSL/TLS',
  'VPN', 'Firewall', 'IAM', 'Zero Trust',
  'Networking', 'TCP/IP', 'DNS', 'Load Balancing',
  'RabbitMQ', 'ActiveMQ', 'NATS', 'Celery',

  // Salesforce / SAP / ERP
  'Salesforce', 'SAP', 'SAP HANA', 'SAP ABAP', 'Workday', 'ServiceNow',
];

// Normalised set for O(1) lookup
const SKILL_SET = new Set(KNOWN_SKILLS.map(s => s.toLowerCase()));

/**
 * Returns an error message if the skill is invalid, or null if valid.
 */
export function validateSkill(raw: string): string | null {
  const skill = raw.trim();

  if (skill.length < 2) return 'Skill must be at least 2 characters';
  if (skill.length > 50) return 'Skill must be 50 characters or fewer';

  if (SKILL_SET.has(skill.toLowerCase())) return null; // known skill — always valid

  // Not in whitelist — reject
  return 'Skill not recognised. Pick from suggestions or type a known technology.';
}

/**
 * Returns matching suggestions from the known skills list.
 */
export function suggestSkills(input: string, exclude: string[] = []): string[] {
  if (!input.trim()) return [];
  const q = input.toLowerCase();
  const excludeLower = new Set(exclude.map(s => s.toLowerCase()));
  return KNOWN_SKILLS.filter(
    s => s.toLowerCase().includes(q) && !excludeLower.has(s.toLowerCase()),
  ).slice(0, 6);
}
