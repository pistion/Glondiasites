export const activeProject = {
  id: 'project_glondia_store_001',
  name: 'Glondia Ecommerce Website',
  businessName: 'Glondia Analysts & Consultancy',
  packageName: 'Growth Store',
  status: 'In progress',
  progress: 62,
  launchTarget: '2026-06-30',
  storefrontTheme: 'Clean Professional',
  requestedSections: ['Hero banner', 'Featured categories', 'Featured products', 'FAQ', 'Newsletter'],
  businessProfile: {
    email: 'hello@glondia.com',
    phone: '+675 7000 1100',
    address: 'Port Moresby, Papua New Guinea',
    country: 'Papua New Guinea',
    timezone: 'Pacific/Port_Moresby',
    currency: 'PGK',
    industry: 'Ecommerce Services',
    description: 'Professional ecommerce website services for businesses that need a dependable online storefront.',
  },
  storeSetup: {
    storeName: 'Glondia Storefront',
    preferredUrl: 'shop.glondia.com',
    productType: 'Physical and digital products',
    productCount: '85 planned products',
    shippingRequired: 'Yes',
    localPickup: 'Yes',
    digitalProducts: 'Yes',
    taxDisplayPreference: 'Tax exclusive on product listing',
  },
  domain: {
    preferred: 'glondia.com',
    primary: 'glondia.com',
    status: 'Reserved',
    sslStatus: 'Pending setup',
    renewalDate: '2027-05-24',
    dnsProvider: 'Cloud DNS',
  },
  hosting: {
    plan: 'Managed Ecommerce Hosting',
    environment: 'Staging',
    deploymentStatus: 'Preview ready',
    region: 'Global CDN',
    lastDeployment: 'Today, 9:10 AM',
    storageUsage: '4.2 GB',
    bandwidthUsage: '28 GB this month',
  },
  storefront: {
    theme: 'Clean Professional',
    primaryColor: '#198754',
    secondaryColor: '#050807',
    typography: 'Inter / system UI',
    headerStyle: 'Standard navigation',
    footerStyle: 'Business footer',
  },
}

export const projects = [
  {
    id: activeProject.id,
    name: activeProject.name,
    businessName: activeProject.businessName,
    packageName: activeProject.packageName,
    status: activeProject.status,
    pages: 12,
    products: 85,
    updatedAt: 'Today',
  },
  {
    id: 'project_local_store_002',
    name: 'Retail Launch Refresh',
    businessName: 'Kumul Retail',
    packageName: 'Starter Store',
    status: 'Needs review',
    pages: 8,
    products: 24,
    updatedAt: 'Yesterday',
  },
  {
    id: 'project_digital_003',
    name: 'Digital Offer Platform',
    businessName: 'Pacific Learning Hub',
    packageName: 'Custom Store',
    status: 'Draft',
    pages: 15,
    products: 42,
    updatedAt: '2 days ago',
  },
]

export const launchChecklist = [
  { id: 1, label: 'Business profile completed', done: true },
  { id: 2, label: 'Storefront style selected', done: true },
  { id: 3, label: 'Homepage content added', done: true },
  { id: 4, label: 'Product categories added', done: true },
  { id: 5, label: 'Products uploaded', done: false },
  { id: 6, label: 'SEO metadata drafted', done: false },
  { id: 7, label: 'Domain selected', done: true },
  { id: 8, label: 'Hosting plan selected', done: true },
  { id: 9, label: 'Final review requested', done: false },
]

export const recentActivity = [
  { id: 1, item: 'Homepage hero updated', actor: 'Glondia Team', time: '1 hour ago' },
  { id: 2, item: 'Product category added', actor: 'Client', time: '3 hours ago' },
  { id: 3, item: 'Ticket response received', actor: 'Support', time: 'Yesterday' },
  { id: 4, item: 'Domain connected', actor: 'Hosting Team', time: 'Yesterday' },
  { id: 5, item: 'SEO title changed', actor: 'Client', time: '2 days ago' },
]

export const ecommercePages = [
  { id: 1, title: 'Home', slug: '/', type: 'Core', status: 'Ready', seoStatus: 'Ready', updatedAt: 'Today' },
  { id: 2, title: 'Shop', slug: '/shop', type: 'Core', status: 'In progress', seoStatus: 'Needs review', updatedAt: 'Today' },
  { id: 3, title: 'Product Template', slug: '/products/:slug', type: 'Template', status: 'In progress', seoStatus: 'Template ready', updatedAt: 'Yesterday' },
  { id: 4, title: 'Cart', slug: '/cart', type: 'Commerce', status: 'Draft', seoStatus: 'Not required', updatedAt: 'Yesterday' },
  { id: 5, title: 'Checkout', slug: '/checkout', type: 'Commerce', status: 'Draft', seoStatus: 'Not required', updatedAt: 'Yesterday' },
  { id: 6, title: 'About', slug: '/about', type: 'Content', status: 'Ready', seoStatus: 'Ready', updatedAt: '2 days ago' },
  { id: 7, title: 'Contact', slug: '/contact', type: 'Content', status: 'Ready', seoStatus: 'Ready', updatedAt: '2 days ago' },
]

export const products = [
  {
    id: 1,
    name: 'Classic Product Display Set',
    sku: 'SKU-001',
    category: 'Featured',
    price: 49,
    stockStatus: 'Draft',
    visibility: 'Visible',
    seoStatus: 'Needs review',
    updatedAt: 'Today',
  },
  {
    id: 2,
    name: 'Premium Launch Bundle',
    sku: 'SKU-002',
    category: 'New Arrivals',
    price: 79,
    stockStatus: 'Active',
    visibility: 'Visible',
    seoStatus: 'Ready',
    updatedAt: 'Today',
  },
  {
    id: 3,
    name: 'Subscription Mock Product',
    sku: 'SKU-003',
    category: 'Digital Products',
    price: 29,
    stockStatus: 'Draft',
    visibility: 'Hidden',
    seoStatus: 'Needs title',
    updatedAt: 'Yesterday',
  },
]

export const productCategories = [
  { id: 1, name: 'Featured', slug: 'featured', count: 18, featured: 'Yes', seoStatus: 'Ready' },
  { id: 2, name: 'New Arrivals', slug: 'new-arrivals', count: 24, featured: 'Yes', seoStatus: 'Needs review' },
  { id: 3, name: 'Digital Products', slug: 'digital-products', count: 12, featured: 'No', seoStatus: 'Ready' },
]

export const ordersUiRows = [
  { id: 'ORD-1010', customer: 'Anna Kila', date: '2026-05-05', total: '$149.00', paymentStatus: 'Paid', fulfillmentStatus: 'Preparing' },
  { id: 'ORD-1009', customer: 'Mark Daro', date: '2026-05-04', total: '$89.00', paymentStatus: 'Pending', fulfillmentStatus: 'Not started' },
  { id: 'ORD-1008', customer: 'Lena Puri', date: '2026-05-03', total: '$205.00', paymentStatus: 'Paid', fulfillmentStatus: 'Ready' },
]

export const customersUiRows = [
  { id: 1, name: 'Anna Kila', email: 'anna@example.com', orders: 6, totalSpent: '$510.00', status: 'Active', lastActivity: 'Today' },
  { id: 2, name: 'Mark Daro', email: 'mark@example.com', orders: 2, totalSpent: '$149.00', status: 'Active', lastActivity: 'Yesterday' },
  { id: 3, name: 'Lena Puri', email: 'lena@example.com', orders: 1, totalSpent: '$205.00', status: 'Needs review', lastActivity: '2 days ago' },
]

export const storefrontSections = [
  { id: 1, name: 'Hero banner', status: 'Ready', updatedAt: 'Today', visible: true },
  { id: 2, name: 'Featured categories', status: 'In progress', updatedAt: 'Today', visible: true },
  { id: 3, name: 'Featured products', status: 'Ready', updatedAt: 'Yesterday', visible: true },
  { id: 4, name: 'Promo banner', status: 'Draft', updatedAt: 'Yesterday', visible: false },
  { id: 5, name: 'Testimonials', status: 'Draft', updatedAt: '2 days ago', visible: false },
  { id: 6, name: 'FAQ', status: 'Ready', updatedAt: '2 days ago', visible: true },
]

export const mediaFiles = [
  { id: 1, name: 'brand-logo.png', type: 'Logo', size: '120 KB', usedOn: 'Header, Footer', uploadedAt: '2026-05-01' },
  { id: 2, name: 'hero-banner.jpg', type: 'Banner image', size: '1.4 MB', usedOn: 'Homepage hero', uploadedAt: '2026-05-03' },
  { id: 3, name: 'collection-shot.jpg', type: 'Product image', size: '860 KB', usedOn: 'Featured products', uploadedAt: '2026-05-04' },
]

export const connectedDomains = [
  { id: 1, domain: 'glondia.com', status: 'Active', sslStatus: 'Pending setup', renewalDate: '2027-05-24' },
  { id: 2, domain: 'shop.glondia.com', status: 'Connected', sslStatus: 'Ready', renewalDate: 'Managed with primary' },
]

export const dnsRecords = [
  { id: 1, type: 'A', host: '@', value: '203.0.113.10', ttl: 'Auto' },
  { id: 2, type: 'CNAME', host: 'www', value: 'glondia.com', ttl: 'Auto' },
  { id: 3, type: 'TXT', host: '_verify', value: 'verification-token', ttl: '1 hour' },
]

export const buildHistory = [
  { id: 1, environment: 'Staging', status: 'Success', createdAt: 'Today, 9:10 AM', duration: '54s' },
  { id: 2, environment: 'Staging', status: 'Success', createdAt: 'Yesterday, 4:20 PM', duration: '59s' },
  { id: 3, environment: 'Preview', status: 'Queued', createdAt: 'Yesterday, 9:18 AM', duration: '--' },
]

export const analyticsCards = [
  { id: 1, label: 'Visitors', value: '8,420', detail: 'Last 30 days' },
  { id: 2, label: 'Product views', value: '19,300', detail: 'Last 30 days' },
  { id: 3, label: 'Checkout starts', value: '412', detail: 'Last 30 days' },
  { id: 4, label: 'Open tickets', value: '3', detail: 'Client communication' },
]

export const topPages = [
  { id: 1, page: 'Home', views: 3240 },
  { id: 2, page: 'Shop', views: 2815 },
  { id: 3, page: 'Product Template', views: 1750 },
]

export const topProducts = [
  { id: 1, product: 'Premium Launch Bundle', views: 840 },
  { id: 2, product: 'Classic Product Display Set', views: 610 },
  { id: 3, product: 'Subscription Mock Product', views: 390 },
]

export const messages = [
  { id: 1, sender: 'Glondia Team', subject: 'Homepage draft is ready', category: 'Project updates', unread: true, time: '10:30 AM', preview: 'The homepage hero and services section are ready for review.' },
  { id: 2, sender: 'Support', subject: 'Domain setup checklist', category: 'Technical support', unread: false, time: 'Yesterday', preview: 'Please confirm the DNS provider before final setup.' },
  { id: 3, sender: 'Billing', subject: 'Package summary for review', category: 'Billing questions', unread: false, time: '2 days ago', preview: 'Sharing the scope summary for the Growth Store package.' },
]

export const messageThreads = {
  1: [
    { id: 1, author: 'Glondia Team', type: 'team', text: 'The homepage draft is ready for your review. We focused on the new ecommerce positioning.', time: '10:30 AM' },
    { id: 2, author: 'You', type: 'client', text: 'Looks good. Please also tighten the support section wording.', time: '10:41 AM' },
  ],
  2: [
    { id: 1, author: 'Support', type: 'team', text: 'We need the DNS provider details before we can finalize SSL and domain setup.', time: 'Yesterday' },
  ],
  3: [
    { id: 1, author: 'Billing', type: 'team', text: 'Attached is the package summary with the current scope and support window.', time: '2 days ago' },
  ],
}

export const notifications = [
  { id: 1, title: 'New ticket reply', detail: 'Homepage banner update', time: '20m ago' },
  { id: 2, title: 'SEO review needed', detail: '3 product entries need metadata', time: '2h ago' },
  { id: 3, title: 'Deployment completed', detail: 'Preview environment is ready', time: 'Yesterday' },
]

export const tickets = [
  { id: 'TCK-1001', subject: 'Homepage banner update', category: 'Design request', priority: 'Medium', status: 'Open', assignedTeam: 'Design', updatedAt: 'Today' },
  { id: 'TCK-1002', subject: 'Need help organizing product categories', category: 'Product catalog', priority: 'High', status: 'Waiting reply', assignedTeam: 'Catalog', updatedAt: 'Yesterday' },
  { id: 'TCK-1003', subject: 'Please confirm hosting launch checklist', category: 'Domain/hosting', priority: 'Low', status: 'Open', assignedTeam: 'Hosting', updatedAt: '2 days ago' },
]

export const ticketActivity = [
  { id: 1, title: 'Ticket created', detail: 'Homepage banner update request submitted', time: 'Today' },
  { id: 2, title: 'Support replied', detail: 'Category planning notes shared', time: 'Yesterday' },
]

export const billingRecords = [
  { id: 'INV-001', date: '2026-05-01', amount: '$1,200.00', status: 'Paid' },
  { id: 'INV-002', date: '2026-04-01', amount: '$200.00', status: 'Paid' },
  { id: 'INV-003', date: '2026-06-01', amount: '$150.00', status: 'Pending' },
]

export const projectFiles = [
  { id: 1, label: 'Logo package', type: 'Brand asset', uploadedAt: '2026-05-01' },
  { id: 2, label: 'Homepage copy draft', type: 'Content file', uploadedAt: '2026-05-03' },
  { id: 3, label: 'Product image set', type: 'Media upload', uploadedAt: '2026-05-04' },
]

export const teamMembers = [
  { id: 1, name: 'Sarah Kora', email: 'sarah@glondia.com', role: 'Owner', status: 'Active', lastActive: 'Today' },
  { id: 2, name: 'David Morea', email: 'david@glondia.com', role: 'Manager', status: 'Active', lastActive: 'Yesterday' },
  { id: 3, name: 'June Tali', email: 'june@glondia.com', role: 'Editor', status: 'Invited', lastActive: 'Pending invite' },
]

export const accountNotifications = [
  { id: 'projectUpdates', label: 'Email project updates', enabled: true },
  { id: 'ticketReplies', label: 'Ticket replies', enabled: true },
  { id: 'billingReminders', label: 'Billing reminders', enabled: false },
  { id: 'launchChecklist', label: 'Launch checklist reminders', enabled: true },
]
