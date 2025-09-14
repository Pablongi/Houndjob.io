import { Category } from '@/types/job';

export const portals = ['Get on Board', 'BNE.cl', 'TrabajoConSentido'];

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

export const MODALITIES = ['Presencial', 'Remoto', 'Híbrido'];

export const EXPERIENCE_LEVELS = ['Junior', 'Mid', 'Senior'];

export const portalToLogo: { [key: string]: string } = {
  'get on board': '/portals/getonboard.png',
  'bne.cl': '/portals/Portal-BNE_logo.png',
  'trabajoconsentido': '/portals/Trabajoconsentido_logo.png',
};

export const TAG_CATEGORIES: Category[] = [
  {
    categoría: 'Programación y Desarrollo de Software',
    subcategorías: [
      { nombre: 'Lenguajes y Frameworks', tags: ['.NET', '.NET Core', 'Angular', 'AngularJS', 'C#', 'CSS', 'CSS3', 'Express.js', 'Flutter', 'Golang', 'Groovy', 'HTML', 'HTML5', 'Java', 'JavaScript', 'Kotlin', 'Laravel', 'NestJS', 'Next.js', 'Node.js', 'PHP', 'Python', 'Ruby', 'Spring Boot', 'Spring Framework', 'Swift', 'Symfony', 'TypeScript', 'Vue.js', 'Yii', 'Gradle', 'React Native', 'Retrofit', 'Ruby on Rails', 'PowerBuilder', 'ASP', 'Flask', 'SQLAlchemy', 'TypeORM', 'Sequelize', 'Vue 2', 'Nuxt 2', 'SCSS'] },
      { nombre: 'Herramientas de Desarrollo', tags: ['Android Studio', 'Git', 'GitHub', 'GitLab', 'Jenkins', 'Maven', 'Visual Studio', 'Bitbucket', 'Microsoft Visual SourceSafe Explorer'] },
      { nombre: 'Prácticas de Desarrollo', tags: ['Agile', 'Agile Methodologies', 'CI/CD', 'DevOps', 'Integración Continua', 'Kanban', 'Metodologías Ágiles', 'Scrum'] },
      { nombre: 'Arquitectura de Software', tags: ['API', 'API Development', 'API Gateway', 'Apigee', 'Arquitectura Software', 'CQRS', 'Event Sourcing', 'Microservicios', 'RESTful APIs', 'UML', 'Algoritmos', 'Estructuras Datos', 'Clean Architecture', 'MVC', 'OData', 'C4', 'Domain-Driven Design (DDD)', 'Arquitectura Hexagonal', 'AsyncAPI', 'OAS3.0'] },
      { nombre: 'Pruebas', tags: ['Appium', 'Cypress', 'Detox', 'Jest', 'phpUnit', 'Robot Framework', 'Selenium', 'Test Cases', 'Blazemeter', 'PMD', 'Striker', 'pytest'] },
      { nombre: 'Otros', tags: ['Axios', 'Context API', 'Desarrollo Software', 'Framework', 'Frontend', 'Full Stack Development', 'FullStack', 'Programación', 'Software', 'Software Design', 'Web Development', 'jQuery', 'JWT', 'Redux', 'Saga', 'Swagger', 'Microaplicaciones', 'WCF', 'Ajax', 'Bootstrap', 'Advanced Custom Fields (ACF)', 'Headless CMS'] },
      { nombre: 'ERP y Sistemas Empresariales', tags: ['SAP MM', 'SAP FI', 'SAP Activos Fijos', 'SAP CO', 'SAP WM'] },
    ],
  },
  {
    categoría: 'Nube e Infraestructura',
    subcategorías: [
      { nombre: 'Plataformas en la Nube', tags: ['AWS', 'Azure', 'Cloud Azure', 'Google Cloud Platform', 'IBM Cloud', 'Oracle Cloud', 'GCP', 'Heroku'] },
      { nombre: 'Servicios en la Nube', tags: ['Amazon CloudFront', 'Lambda', 'Route53', 'Azure Data Factory', 'Azure Synapse', 'Data Lake', 'Azure Databricks', 'Amazon Redshift', 'BigQuery', 'Cloud Functions', 'PubSub', 'AWS S3', 'AWS Athena', 'AWS Glue', 'AWS Redshift'] },
      { nombre: 'Herramientas de Infraestructura', tags: ['Docker', 'Kubernetes', 'Terraform', 'Ansible'] },
      { nombre: 'Redes y Protocolos', tags: ['BGP', 'DHCP', 'DNS', 'FTP', 'HTTP', 'NTP', 'TCP/IP', 'OSPF', 'EIGRP', 'IS-IS', 'NAT'] },
      { nombre: 'Servidores y Servicios Web', tags: ['Apache', 'JBOSS', 'Nginx', 'Webserver', 'WEBLOGIC'] },
      { nombre: 'Otros', tags: ['Cloud', 'Cloud Computing', 'IAAS', 'SaaS', 'ASM', 'BASH', 'Cisco', 'PCI DSS', 'ISO 27001', 'Power Platform'] },
    ],
  },
  {
    categoría: 'Datos y Análisis',
    subcategorías: [
      { nombre: 'Bases de Datos', tags: ['Cassandra', 'MariaDB', 'MongoDB', 'MySQL', 'NoSQL', 'Oracle', 'Oracle Multitenant', 'Oracle PL/SQL', 'Oracle RAC', 'PostgreSQL', 'Redis'] },
      { nombre: 'Herramientas de Datos', tags: ['DataGuard', 'DataPump', 'GoldenGate', 'PL/SQL', 'RMAN', 'SQL', 'SQL Tuning', 'Stored Procedure', 'Informatica', 'Talend', 'dbt', 'Airflow', 'Mage'] },
      { nombre: 'Análisis y Visualización de Datos', tags: ['Análisis Datos', 'Business Intelligence', 'Data Analysis', 'Data Scientist', 'Google Data Studio', 'Looker Studio', 'Power BI', 'Tableau', 'Matplotlib', 'Seaborn', 'Plotly'] },
      { nombre: 'Big Data y Streaming', tags: ['Apache Airflow', 'Apache Kafka', 'Big Data', 'ELK Stack', 'Kafka', 'NiFi', 'Datalakes', 'Hadoop', 'Spark', 'Scala'] },
      { nombre: 'Aprendizaje Automático e IA', tags: ['Machine Learning', 'PyTorch', 'TensorFlow', 'IBM Watson', 'Open AI', 'Streamlit', 'Bayesian Statistics', 'Deep Learning', 'Redes Neuronales', 'YOLO', 'Faster R-CNN', 'EfficientDet', 'TensorRT', 'OpenCV', 'BERT', 'GPT', 'Dialogflow'] },
      { nombre: 'Monitoreo y Analíticas', tags: ['Datadog', 'Google Analytics', 'Google Search Console', 'Google Tag Manager', 'Hotjar', 'KPI Monitoring', 'Screaming Frog', 'SEMRush', 'Ubbersuggest'] },
      { nombre: 'Gobernanza de Datos', tags: ['Apache Atlas', 'Collibra'] },
      { nombre: 'Otros', tags: ['MLOps', 'Cross-validation', 'Análisis de Series Temporales', 'Modelado Predictivo', 'Modelado Prescriptivo', 'Clustering', 'Reducción de Dimensionalidad', 'Diseño de Experimentos', 'Métricas de Evaluación (mAP, IoU, Recall, Precision)'] },
    ],
  },
  {
    categoría: 'Ciberseguridad y Seguridad TI',
    subcategorías: [
      { nombre: 'Herramientas de Seguridad', tags: ['Auth0', 'Deep Security', 'Firewalls', 'OpenID Connect', 'RedHat SSO', 'Tenable', 'Trend Micro', 'Vision One', 'Cisco ASA', 'Firepower', 'Palo Alto', 'Fortinet', 'NSE 4'] },
      { nombre: 'Prácticas', tags: ['Ciberseguridad', 'Ethical Hacking', 'Information Security', 'Penetration Testing', 'Seguridad', 'Seguridad TI'] },
      { nombre: 'Frameworks', tags: ['COBIT', 'ITIL'] },
      { nombre: 'Normativas y Estándares de Seguridad', tags: ['ISO 27002', 'ISO 27017', 'ISO 27018', 'CIS Control', 'PCI-DSS', 'GDPR', 'BCBS 239'] },
      { nombre: 'Seguridad Electrónica', tags: ['CCTV', 'Plataformas de Videovigilancia', 'Monitoreo 24/7'] },
      { nombre: 'Otros', tags: ['VPNs', 'ACLs', 'High Level Design (HLD)', 'Low Level Design (LLD)'] },
    ],
  },
  {
    categoría: 'Operaciones y Sistemas TI',
    subcategorías: [
      { nombre: 'Sistemas Operativos', tags: ['Linux', 'Unix', 'Sistemas Operativos'] },
      { nombre: 'Administración de Sistemas', tags: ['Active Directory', 'Backup', 'Exchange'] },
      { nombre: 'Automatización y Monitoreo', tags: ['Automatización', 'Control-M', 'Monitoreo'] },
      { nombre: 'Virtualización', tags: ['VMware', 'Hyper-V', 'GCE', 'GCVE'] },
      { nombre: 'Infraestructura Sanitaria', tags: ['PTAS', 'PEAS', 'PEAP', 'PTAP', 'Redes de Agua Potable', 'Redes de Aguas Servidas'] },
      { nombre: 'Otros', tags: ['DBA', 'ITO', 'NTT Framework', 'OCI', 'SAP Cloud Platform Integration (CPI)', 'Webhooks', 'Active MQ', 'AIX'] },
    ],
  },
  {
    categoría: 'Diseño y Multimedia',
    subcategorías: [
      { nombre: 'Herramientas de Diseño', tags: ['Adobe Creative Cloud', 'After Effects', 'AutoCAD', 'Blender', 'Cinema 4D', 'Figma', 'Premiere', 'Unreal Engine', 'Sketch', 'Zeplin', 'Maya', '3ds Max', 'V-Ray', 'Redshift', 'Nuke', 'Houdini'] },
      { nombre: 'Prácticas de Diseño', tags: ['Motion Graphics', 'UX/UI Design', 'Visual Effects', 'Design Thinking', 'Lean UX', 'Double Diamond', 'Material Design', 'A/B Testing'] },
      { nombre: 'Gestión de Contenidos', tags: ['CMS', 'Drupal', 'Moodle', 'Shopify', 'WordPress'] },
      { nombre: 'Impresión y Producción Gráfica', tags: ['Máquina Roland RF 640', 'Plotter de Corte Mimaki', 'Impresión Digital'] },
      { nombre: 'Otros', tags: ['Transcoding', 'Video Encoding', 'Prototipos de Alta Fidelidad', 'Prototipos de Media Fidelidad', 'Prototipos de Baja Fidelidad', 'WCAG Compliance'] },
    ],
  },
  {
    categoría: 'Negocios y Gestión',
    subcategorías: [
      { nombre: 'Gestión de Proyectos', tags: ['Confluence', 'Jira', 'PMI', 'Primavera P6', 'Project Management', 'Proyectos', 'Trello', 'Productboard', 'MS Project'] },
      { nombre: 'Procesos de Negocio', tags: ['Contract Management', 'Cost Control', 'CRM', 'CRM Systems', 'ERP', 'Forecasting', 'Inventarios', 'Inventory Management', 'Logistics', 'S&OP', 'Stock Control', 'Supply Planning', 'Transformación Digital', 'Gestión de Stakeholders', 'Contabilidad Bancaria', 'Assurance Contable', 'BPMN', 'Visio'] },
      { nombre: 'Ventas y Marketing', tags: ['B2B Sales', 'Client Management', 'Consultative Sales', 'Conversion Rate Optimization', 'Customer Success', 'Marketing', 'Marketing Digital', 'Paid Media', 'Sales', 'Salesforce', 'SEM', 'SEO', 'Social Media', 'Software Sales', 'Social Selling', 'Outbound Lead Generation', 'Instanly.ai', 'Apollo.io', 'Outreach', 'Intercom', 'Fidelización de Clientes'] },
      { nombre: 'Finanzas y Contabilidad', tags: ['Accounting', 'Analista Contable', 'Contabilidad', 'Contability', 'Cuadraturas', 'Facturación', 'Financial Analysis', 'Financial Specialist', 'Finanzas', 'Overdue Management', 'Payroll', 'Rendición Cuentas', 'Supplier Payments', 'Excel', 'Microsoft Office', 'Office Tools', 'Power Apps', 'Power Automate', 'Softland', 'IVA', 'ISR', 'Excel Avanzado'] },
      { nombre: 'Recursos Humanos y Organización', tags: ['HR Management', 'Onboarding', 'Organizational Development', 'People Analytics', 'Performance Management', 'Recruitment Services', 'Gestión del Cambio', 'Desarrollo Organizacional'] },
      { nombre: 'Gestión Administrativa', tags: ['Asistente Administrativa', 'Control de Asistencia', 'Sistemas Biométricos', 'Gestión de Contratos'] },
      { nombre: 'Otros', tags: ['Commerce Exterior', 'Importation', 'Innovation', 'Negotiation', 'PNL', 'Process Improvement', 'Risk Management', 'Strategic Thinking', 'Analista Operaciones', 'Banca', 'Comercio', 'Factoring', 'Fraudes', 'Seguros', 'Business Analytics', 'Gestión Tributaria', 'Resolución de Disputas', 'Postventa', 'Tasaciones Comerciales'] },
    ],
  },
  {
    categoría: 'Atención al Cliente y Soporte',
    subcategorías: [
      { nombre: 'Atención al Cliente', tags: ['Atención Cliente', 'Call Center', 'Customer Orientation', 'Customer Satisfaction', 'Customer Service', 'Customer Support'] },
      { nombre: 'Ventas y Comunicación', tags: ['Telesales', 'Communication', 'Comunicación'] },
      { nombre: 'Soporte Técnico', tags: ['Soporte Técnico en Terreno', 'Conectividad'] },
      { nombre: 'Otros', tags: ['Client Management', 'Multitasking'] },
    ],
  },
  {
    categoría: 'Habilidades Específicas de Industria',
    subcategorías: [
      { nombre: 'Agricultura y Medio Ambiente', tags: ['Agricultural Work', 'Agronomy', 'ASC Certification', 'Environmental Engineering', 'Environmental Impact Assessment', 'Fruit Export', 'Pruning', 'Sustainability', 'Marin Trust'] },
      { nombre: 'Construcción y Mantenimiento', tags: ['Construction', 'Electromechanical Maintenance', 'Electromechanical Repair', 'Electromechanics', 'Industrial Maintenance', 'Road Maintenance', 'Scaffolding', 'Maintenance', 'AIF'] },
      { nombre: 'Manufactura y Mecánica', tags: ['Combustion Engines', 'Door Manufacturing', 'Industrial Machinery', 'Machine Operation', 'Mecánica', 'Mechanic', 'Metal Fabrication', 'Metalmecánica', 'Mold Manufacturing', 'Soldadura', 'TIG Welding', 'Welding', 'Mechanical Workshop', 'Cepillo Puente', 'CNC', 'Camión Pluma', 'Alza Hombres'] },
      { nombre: 'Logística y Transporte', tags: ['Cold Chain', 'Dispatch', 'Load Handling', 'Logística', 'Logistics', 'Passenger Transport', 'Servicios Logísticos', 'Truck Driving', 'Warehouse', 'Operario Bodega', 'Operario Producción', 'Ingeniería en Transporte', 'Remesa', 'MiniCargador', 'Mini Excavadora', 'Camión Tolva'] },
      { nombre: 'Minería', tags: ['Minery', 'Mining'] },
      { nombre: 'Operaciones Mineras', tags: ['Maestro Perforista', 'Controlador de Sondaje', 'Instrumentación Hidrogeológica', 'Aire Reverso', 'Camión Polvorín', 'Operador Bulldozer'] },
      { nombre: 'Vinificación', tags: ['Molienda', 'Prensado', 'Fermentación', 'Embotellación'] },
      { nombre: 'Otros', tags: ['Camp Maintenance', 'Control Plagas', 'Gasfiter', 'General Services', 'Raw Materials Handling', 'Sanitary Installation', 'Water Supply', 'Producción', 'Production Support', 'Consumo Masivo'] },
    ],
  },
  {
    categoría: 'Salud y Servicios Sociales',
    subcategorías: [
      { nombre: 'Salud', tags: ['Anestesiología', 'Contactología', 'Enfermería', 'Instrumentista Quirúrgico', 'Optometría', 'Paramédico', 'Pabellón', 'Salud', 'Fonoaudiología', 'Medicina General', 'Cirugía', 'Otorrinolaringología', 'Urgencias Médicas', 'Salud Ocupacional', 'Técnico en Farmacia', 'Gestión de Medicamentos', 'Traqueostomía', 'Gastrostomía', 'EPP (Elementos de Protección Personal)', 'Control de Signos Vitales', 'Aseo y Confort'] },
      { nombre: 'Servicios Sociales', tags: ['Human Rights', 'Psychosocial Intervention', 'Social Work', 'Trabajo Social', 'Special Education', 'Youth Rehabilitation', 'Convivencia Escolar', 'Intervención Psicoeducativa'] },
      { nombre: 'Certificaciones Médicas', tags: ['Registro SIS', 'ACLS', 'ATLS', 'Medicina en Altura'] },
    ],
  },
  {
    categoría: 'Marketing y Medios Digitales',
    subcategorías: [
      { nombre: 'Marketing Digital', tags: ['Content Marketing', 'Google Ads', 'Growth Marketing', 'Influencers', 'Redes Sociales', 'Marketing Conversacional', 'SEO Técnico Avanzado'] },
      { nombre: 'Herramientas y Plataformas', tags: ['Facebook', 'Hubspot', 'Social Media', 'Amplitude', 'Clarity', 'Botnaker', 'Twilio'] },
      { nombre: 'Otros', tags: ['Retail', 'Retail Projects', 'Arquitectura Web', 'Ecosistema Digital', 'Infraestructura Web', 'HTTPS', 'E-commerce', 'Marketplace'] },
    ],
  },
  {
    categoría: 'Habilidades Blandas e Idiomas',
    subcategorías: [
      { nombre: 'Habilidades Blandas', tags: ['Adaptability', 'Analytical', 'Attention to Detail', 'Autonomy', 'Collaboration', 'Communication', 'Customer Orientation', 'Flexibilidad', 'Leadership', 'Problem-solving', 'Proactivity', 'Teamwork', 'Time Management', 'Trabajo Equipo', 'Pensamiento Crítico', 'Resolución de Problemas', 'Orientación a Resultados', 'Adaptabilidad a Cambios', 'Autonomía', 'Colaboración con Stakeholders', 'Comunicación con C-Level', 'Comunicación Efectiva', 'Orientación al Cliente'] },
      { nombre: 'Idiomas', tags: ['Bilingual', 'Bilingüe', 'English', 'German', 'Inglés', 'Mandarin', 'Portuguese', 'Spanish', 'Inglés Nativo', 'Inglés Técnico'] },
      { nombre: 'Competencias Legales', tags: ['Ley Karin', 'Ley 21.369', 'Derecho Corporativo', 'Litigación'] },
    ],
  },
  {
    categoría: 'Otras Habilidades Especializadas',
    subcategorías: [
      { nombre: 'Certificaciones y Licencias', tags: ['A2 License', 'A3 License', 'A4 License', 'A5 License', 'Certificaciones', 'PL-900', 'MS-900', 'AZ-400', 'FinOps Practitioner', 'UiPath Certified Professional (UCP)'] },
      { nombre: 'Educación y Capacitación', tags: ['Educación', 'Tour Guide', 'Tourism'] },
      { nombre: 'Servicios de Seguridad', tags: ['Guard Services', 'Guardia Seguridad', 'Rondinero'] },
      { nombre: 'Culinaria y Hospitalidad', tags: ['Culinary', 'Pizza Making'] },
      { nombre: 'Automatización RPA', tags: ['UiPath', 'UiPath Studio', 'Orchestrator'] },
      { nombre: 'Otros', tags: ['Aseo', 'Cleaning', 'Hygiene', 'Diversity', 'Freelance', 'PLC', 'Prevención Riesgos', 'Quality Management', 'QA', 'Regulatory Compliance', 'Safety Regulations', 'SAS', 'Scripting', 'Tailwind CSS', 'Tecnología', 'Trabajo Híbrido', 'Low-Code', 'Power FX', 'VB.NET', 'Core Bancario', 'Gestión de Costos', 'Gestión de Riesgos', 'Migración de Plataformas', 'Servicios OT', 'SAP S/4HANA', 'ABAP', 'Mueblista', 'Formalita'] },
    ],
  },
  {
    categoría: 'Automatización RPA',
    subcategorías: [
      { nombre: 'Herramientas RPA', tags: ['UiPath', 'UiPath Studio', 'Orchestrator'] },
      { nombre: 'Otros', tags: ['Low-Code', 'Power FX'] },
    ],
  },
  {
    categoría: 'Inteligencia Artificial y Modelos de Lenguaje',
    subcategorías: [
      { nombre: 'Frameworks de IA/LLM', tags: ['Hugging Face', 'LangChain', 'LlamaIndex'] },
      { nombre: 'Otros', tags: ['MLOps', 'BERT', 'GPT', 'Dialogflow'] },
    ],
  },
  {
    categoría: 'Gestión de Proyectos TI',
    subcategorías: [
      { nombre: 'Herramientas de Gestión', tags: ['Jira', 'Confluence', 'Trello', 'Productboard', 'MS Project'] },
      { nombre: 'Metodologías', tags: ['Agile', 'Scrum', 'Kanban', 'PMI'] },
      { nombre: 'Otros', tags: ['Gestión de Stakeholders', 'Transformación Digital'] },
    ],
  },
];

export const catToSubs = new Map<string, Set<string>>();
TAG_CATEGORIES.forEach(category => {
  const subs = new Set(category.subcategorías.map(sub => sub.nombre));
  catToSubs.set(category.categoría, subs);
});

export const subToTags = new Map<string, Set<string>>();
TAG_CATEGORIES.forEach(category => {
  category.subcategorías.forEach(sub => {
    const tags = new Set(sub.tags);
    subToTags.set(sub.nombre, tags);
  });
});