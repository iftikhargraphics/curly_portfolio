/* =====================================================================
   IFTIKHAR UDDIN — PORTFOLIO DATA
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to add projects or contact info.

   HOW TO ADD A PROJECT
   1. Put the image in /projects (e.g. projects/my-logo.jpg).
      Graphic design: ~1600 x 1200 px.  Websites: ~1600 x 1000 screenshot.
   2. Copy one object from the "projects" list below, paste it, edit it.
   3. Delete `placeholder: true` from the entries you replace (or delete
      the placeholder entries entirely).

   FIELDS
     id           unique short id, e.g. 'logo-acme'
     category     'graphic' | 'web' | 'ai'
     name         project name
     type         e.g. 'Logo Design', 'Business Website', 'AI Business Chatbot'
     description  1-2 sentences shown in the book
     image        path to image, e.g. 'projects/my-logo.jpg'
     alt          (optional) alt text for the image
     technologies list of tools / technologies
     year         e.g. '2026'
     liveUrl      live website URL (web projects)
     githubUrl    GitHub repository URL
     details      longer text shown in the project popup
     features     list of key features (web projects)
     problem, solution, result    (AI projects) — keep results truthful
     caseStudy    (optional) { challenge, concept, design, development,
                    result, images: { challenge: 'projects/x.jpg', ... } }

   EXAMPLE (remove the comment markers to use)
   {
     id: 'my-first-logo',
     category: 'graphic',
     name: 'Your Real Project Name',
     type: 'Logo Design',
     description: 'What the brief was and what you delivered.',
     image: 'projects/my-first-logo.jpg',
     technologies: ['Adobe Illustrator'],
     year: '2026',
     details: 'Longer explanation for the popup.',
     caseStudy: {
       challenge: 'The client needed ...',
       concept: 'I explored ...',
       design: 'Typography, colour ...',
       development: 'Delivered as vector files ...',
       result: 'Final logo suite ...'
     }
   },
   ===================================================================== */

window.PORTFOLIO = {
  /* Contact + identity. Leave a value '' to keep the placeholder. */
  profile: {
    name: 'Iftikhar Uddin',
    portrait: 'images/portrait.jpg',   // put your photo at images/portrait.jpg
    email: '',                          // e.g. 'you@example.com'
    whatsapp: '',                       // international format, e.g. '+923001234567'
    linkedin: '',                       // e.g. 'https://www.linkedin.com/in/your-name'
    github: '',                         // e.g. 'https://github.com/your-username'
    website: ''                         // e.g. 'https://yourdomain.com'
  },

  /* Projects. The entries below are PLACEHOLDERS (placeholder: true). */
  projects: [
    /* ---------- GRAPHIC DESIGN ---------- */
    {
      id: 'graphic-1', category: 'graphic', placeholder: true,
      name: 'nova wear branding', type: 'Logo Design',
      description: 'this project i designed for a client who started new bussiness of shoes.',
      image: 'images/design_1.jpg', technologies: ['Adobe Illustrator'], year: '2025',
      details: 'the client just gave me the name and purpose . i created this design with correct color pallete for his bussiness and deliverd logo in png and color palletes with printable designs .'
    },
    {
      id: 'graphic-2', category: 'graphic', placeholder: true,
      name: 'post design for organo polymers', type: 'post design',
      description: 'I designed this post for Organo Polymers .',
      image: 'images/design_2.png', technologies: ['Adobe Illustrator', 'Adobe Photoshop'], year: '2026',
      details: 'I use the color of his company the post design '
    },
    {
      id: 'graphic-3', category: 'graphic', placeholder: true,
      name: 'Idustrial Bag Design ', type: 'printable design ',
      description: 'I designed Printable bag for agon Polymers ',
      image: 'images/design_3.jpg', technologies: ['Canva', 'Adobe Photoshop'], year: '2026',
      details: 'I used same color Pallete for the design the client given to me .'
    },

    /* ---------- WEB DEVELOPMENT ---------- */
    {
      id: 'web-1', category: 'web', placeholder: true,
      name: 'MANFREDS CAFE', type: 'Business Website',
      description: 'A modern responsive website designed to create a professional digital presence for the business of a cafe based on sanfransisco.',
      image: 'images/web1.jpg', technologies: ['HTML', 'CSS', 'JavaScript'], year: '2026',
      liveUrl: 'https://iftikhargraphics.github.io/manfreds.cafe/', githubUrl: 'https://iftikhargraphics.github.io/manfreds.cafe/',
      features: ['Responsive design', 'Modern UI', 'Mobile navigation', 'Interactive components', 'SEO-friendly structure'],
      details: 'This website i have created for manfreds cafe in san fransisco .'
    },
    {
      id: 'web-2', category: 'web', placeholder: true,
      name: 'BABAKHEL MINING COMPANY', type: 'mining company Website',
      description: 'Short project description — a menu-focused, mobile-friendly website.',
      image: 'images/web2.jpg', technologies: ['HTML', 'CSS', 'JavaScript'], year: '2026',
      liveUrl: 'babakhelminingcompany.com', githubUrl: '',
      features: ['Responsive design', 'Menu layout', 'Mobile navigation', 'Contact section', 'Fast loading'],
      details: 'This website i created for babakhel mining company .'
    },

    /* ---------- AI SOLUTIONS ---------- */
    {
      id: 'ai-1', category: 'ai', placeholder: true,
      name: 'Project Name', type: 'AI Business Chatbot',
      description: 'An AI-powered chatbot designed to answer customer questions, provide business information and automate basic communication.',
      image: '', technologies: ['Python', 'FastAPI', 'AI APIs', 'WhatsApp / API integration'], year: '2026',
      problem: 'Describe the communication problem the business had.',
      solution: 'Describe the chatbot you built and how it works.',
      result: 'Describe the real, verifiable outcome. Leave blank if none yet.',
      githubUrl: '', liveUrl: '',
      details: 'i created a chatbot that can reply to cutomers by itself.'
    }
  ]
};
