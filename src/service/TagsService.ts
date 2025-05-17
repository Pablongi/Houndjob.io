// TagsService.ts
const TAG_CATEGORIES = [
  {
    categoría: "Programación y Desarrollo de Software",
    subcategorías: {
      "Lenguajes y Frameworks": [".NET", ".NET Core", "Angular", "AngularJS", "C#", "CSS", "CSS3", "Express.js", "Flutter", "Golang", "Groovy", "HTML", "HTML5", "Java", "JavaScript", "Kotlin", "Laravel", "NestJS", "Next.js", "Node.js", "PHP", "Python", "Ruby", "Spring Boot", "Spring Framework", "Swift", "Symfony", "TypeScript", "Vue.js", "Yii"],
      "Herramientas de Desarrollo": ["Android Studio", "Git", "GitHub", "GitLab", "Jenkins", "Maven", "Visual Studio"],
      "Prácticas de Desarrollo": ["Agile", "Agile Methodologies", "CI/CD", "DevOps", "Integración Continua", "Kanban", "Metodologías Ágiles", "Scrum"],
      "Arquitectura de Software": ["API", "API Development", "API Gateway", "Apigee", "Arquitectura Software", "CQRS", "Event Sourcing", "Microservicios", "RESTful APIs", "UML", "Algoritmos", "Estructuras Datos"],
      "Pruebas": ["Appium", "Cypress", "Detox", "Jest", "phpUnit", "Robot Framework", "Selenium", "Test Cases"],
      "Otros": ["Axios", "Context API", "Desarrollo Software", "Framework", "Frontend", "Full Stack Development", "FullStack", "Programación", "Software", "Software Design", "Web Development", "jQuery", "JWT"]
    }
  },
  {
    categoría: "Nube e Infraestructura",
    subcategorías: {
      "Plataformas en la Nube": ["AWS", "Azure", "Cloud Azure", "Google Cloud Platform", "IBM Cloud", "Oracle Cloud", "GCP"],
      "Servicios en la Nube": ["Amazon CloudFront", "Lambda", "Route53"],
      "Herramientas de Infraestructura": ["Docker", "Kubernetes", "Terraform"],
      "Redes y Protocolos": ["BGP", "DHCP", "DNS", "FTP", "HTTP", "NTP", "TCP/IP"],
      "Servidores y Servicios Web": ["Apache", "JBOSS", "Nginx", "Webserver", "WEBLOGIC"],
      "Otros": ["Cloud", "Cloud Computing", "IAAS", "SaaS", "ASM", "BASH", "Cisco"]
    }
  },
  {
    categoría: "Datos y Análisis",
    subcategorías: {
      "Bases de Datos": ["Cassandra", "MariaDB", "MongoDB", "MySQL", "NoSQL", "Oracle", "Oracle Multitenant", "Oracle PL/SQL", "Oracle RAC", "PostgreSQL", "Redis"],
      "Herramientas de Datos": ["DataGuard", "DataPump", "GoldenGate", "PL/SQL", "RMAN", "SQL", "SQL Tuning", "Stored Procedure"],
      "Análisis y Visualización de Datos": ["Análisis Datos", "Business Intelligence", "Data Analysis", "Data Scientist", "Google Data Studio", "Looker Studio", "Power BI", "Tableau"],
      "Big Data y Streaming": ["Apache Airflow", "Apache Kafka", "Big Data", "ELK Stack", "Kafka", "NiFi"],
      "Aprendizaje Automático e IA": ["Machine Learning", "PyTorch", "TensorFlow", "IBM Watson", "Open AI", "Streamlit"],
      "Monitoreo y Analíticas": ["Datadog", "Google Analytics", "Google Search Console", "Google Tag Manager", "Hotjar", "KPI Monitoring", "Screaming Frog", "SEMRush", "Ubbersuggest"]
    }
  },
  {
    categoría: "Ciberseguridad y Seguridad TI",
    subcategorías: {
      "Herramientas de Seguridad": ["Auth0", "Deep Security", "Firewalls", "OpenID Connect", "RedHat SSO", "Tenable", "Trend Micro", "Vision One"],
      "Prácticas": ["Ciberseguridad", "Ethical Hacking", "Information Security", "Penetration Testing", "Seguridad", "Seguridad TI"],
      "Frameworks": ["COBIT", "ITIL"]
    }
  },
  {
    categoría: "Operaciones y Sistemas TI",
    subcategorías: {
      "Sistemas Operativos": ["Linux", "Unix", "Sistemas Operativos"],
      "Administración de Sistemas": ["Active Directory", "Backup", "Exchange"],
      "Automatización y Monitoreo": ["Automatización", "Control-M", "Monitoreo"],
      "Otros": ["DBA", "ITO", "NTT Framework", "OCI"]
    }
  },
  {
    categoría: "Diseño y Multimedia",
    subcategorías: {
      "Herramientas de Diseño": ["Adobe Creative Cloud", "After Effects", "AutoCAD", "Blender", "Cinema 4D", "Figma", "Premiere", "Unreal Engine"],
      "Prácticas de Diseño": ["Motion Graphics", "UX/UI Design", "Visual Effects"],
      "Gestión de Contenidos": ["CMS", "Drupal", "Moodle", "Shopify", "WordPress"],
      "Otros": ["Transcoding", "Video Encoding"]
    }
  },
  {
    categoría: "Negocios y Gestión",
    subcategorías: {
      "Gestión de Proyectos": ["Confluence", "Jira", "PMI", "Primavera P6", "Project Management", "Proyectos"],
      "Procesos de Negocio": ["Contract Management", "Cost Control", "CRM", "CRM Systems", "ERP", "Forecasting", "Inventarios", "Inventory Management", "Logistics", "S&OP", "Stock Control", "Supply Planning"],
      "Ventas y Marketing": ["B2B Sales", "Client Management", "Consultative Sales", "Conversion Rate Optimization", "Customer Success", "Marketing", "Marketing Digital", "Paid Media", "Sales", "Salesforce", "SEM", "SEO", "Social Media", "Software Sales"],
      "Finanzas y Contabilidad": ["Accounting", "Analista Contable", "Contabilidad", "Contability", "Cuadraturas", "Facturación", "Financial Analysis", "Financial Specialist", "Finanzas", "Overdue Management", "Payroll", "Rendición Cuentas", "Supplier Payments", "Excel", "Microsoft Office", "Office Tools", "Power Apps", "Power Automate", "Softland"],
      "Recursos Humanos y Organización": ["HR Management", "Onboarding", "Organizational Development", "People Analytics", "Performance Management", "Recruitment Services"],
      "Otros": ["Commerce Exterior", "Importation", "Innovation", "Negotiation", "PNL", "Process Improvement", "Risk Management", "Strategic Thinking", "Analista Operaciones", "Banca", "Comercio", "Factoring", "Fraudes", "Seguros"]
    }
  },
  {
    categoría: "Atención al Cliente y Soporte",
    subcategorías: {
      "Atención al Cliente": ["Atención Cliente", "Call Center", "Customer Orientation", "Customer Satisfaction", "Customer Service", "Customer Support"],
      "Ventas y Comunicación": ["Telesales", "Communication", "Comunicación"],
      "Otros": ["Client Management", "Multitasking"]
    }
  },
  {
    categoría: "Habilidades Específicas de Industria",
    subcategorías: {
      "Agricultura y Medio Ambiente": ["Agricultural Work", "Agronomy", "ASC Certification", "Environmental Engineering", "Environmental Impact Assessment", "Fruit Export", "Pruning", "Sustainability", "Marin Trust"],
      "Construcción y Mantenimiento": ["Construction", "Electromechanical Maintenance", "Electromechanical Repair", "Electromechanics", "Industrial Maintenance", "Road Maintenance", "Scaffolding", "Maintenance"],
      "Manufactura y Mecánica": ["Combustion Engines", "Door Manufacturing", "Industrial Machinery", "Machine Operation", "Mecánica", "Mechanic", "Metal Fabrication", "Metalmecánica", "Mold Manufacturing", "Soldadura", "TIG Welding", "Welding", "Mechanical Workshop"],
      "Logística y Transporte": ["Cold Chain", "Dispatch", "Load Handling", "Logística", "Logistics", "Passenger Transport", "Servicios Logísticos", "Truck Driving", "Warehouse", "Operario Bodega", "Operario Producción"],
      "Minería": ["Minery", "Mining"],
      "Otros": ["Camp Maintenance", "Control Plagas", "Gasfiter", "General Services", "Raw Materials Handling", "Sanitary Installation", "Water Supply", "Producción", "Production Support"]
    }
  },
  {
    categoría: "Salud y Servicios Sociales",
    subcategorías: {
      "Salud": ["Anestesiología", "Contactología", "Enfermería", "Instrumentista Quirúrgico", "Optometría", "Paramédico", "Pabellón", "Salud"],
      "Servicios Sociales": ["Human Rights", "Psychosocial Intervention", "Social Work", "Trabajo Social", "Special Education", "Youth Rehabilitation"]
    }
  },
  {
    categoría: "Marketing y Medios Digitales",
    subcategorías: {
      "Marketing Digital": ["Content Marketing", "Google Ads", "Growth Marketing", "Influencers", "Redes Sociales"],
      "Herramientas y Plataformas": ["Facebook", "Hubspot", "Social Media"],
      "Otros": ["Retail", "Retail Projects"]
    }
  },
  {
    categoría: "Habilidades Blandas e Idiomas",
    subcategorías: {
      "Habilidades Blandas": ["Adaptability", "Analytical", "Attention to Detail", "Autonomy", "Collaboration", "Communication", "Customer Orientation", "Flexibilidad", "Leadership", "Problem-solving", "Proactivity", "Teamwork", "Time Management", "Trabajo Equipo"],
      "Idiomas": ["Bilingual", "Bilingüe", "English", "German", "Inglés", "Mandarin", "Portuguese", "Spanish"]
    }
  },
  {
    categoría: "Otras Habilidades Especializadas",
    subcategorías: {
      "Certificaciones y Licencias": ["A2 License", "A3 License", "A4 License", "A5 License", "Certificaciones"],
      "Educación y Capacitación": ["Educación", "Tour Guide", "Tourism"],
      "Servicios de Seguridad": ["Guard Services", "Guardia Seguridad", "Rondinero"],
      "Culinaria y Hospitalidad": ["Culinary", "Pizza Making"],
      "Otros": ["Aseo", "Cleaning", "Hygiene", "Diversity", "Freelance", "PLC", "Prevención Riesgos", "Quality Management", "QA", "Regulatory Compliance", "Safety Regulations", "SAS", "Scripting", "SVM", "Tailwind CSS", "Tecnología", "Trabajo Híbrido"]
    }
  }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Tag { categoría: string; subcategoría: string; tag: string }

const TagsService = {
  extractTags: (desc: string): string[] => {
    if (!desc) return [];

    const cleanDesc = desc.replace(/<[^>]+>|\W+/g, ' ').toLowerCase().trim();
    const descWords = new Set(cleanDesc.split(' ').filter(word => word.length > 0));
    const foundTags: string[] = [];

    for (const { subcategorías } of TAG_CATEGORIES) {
      for (const [, tags] of Object.entries(subcategorías)) {
        for (const tag of tags) {
          const cleanTag = tag.toLowerCase().replace(/[&/]/g, ' ');
          if (
            cleanDesc.includes(cleanTag) ||
            (cleanTag.includes(' ') && cleanTag.split(' ').every((word: string) => descWords.has(word)))
          ) {
            foundTags.push(tag);
            if (foundTags.length >= 5) return foundTags;
          }
        }
      }
    }

    return foundTags;
  }
};

export { TagsService, TAG_CATEGORIES };