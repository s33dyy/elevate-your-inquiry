import brainTumorDemo from "@/assets/brain-tumor-demo.mov.asset.json";
import smallBusinessHero from "@/assets/small-business-website-hero.jpg";
import brainTumorHero from "@/assets/brain-tumor-hero.jpg";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang?: string; text: string }
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string; alt?: string; caption?: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readingTime: string;
  tags: string[];
  heroImage?: string;
  heroAlt?: string;
  tldr?: string[];
  blocks: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-every-small-business-needs-a-website",
    title:
      "Why Every Small Business Needs a Website in 2026 (And Why Social Media Alone Isn't Enough)",
    excerpt:
      "A professional website builds trust, generates leads, improves SEO, and helps your business grow 24/7 — beyond what social media can do alone.",
    author: "Techilla",
    date: "July 2026",
    readingTime: "10–12 min read",
    tags: ["Web Development", "Small Business", "SEO", "Growth"],
    heroImage: smallBusinessHero,
    heroAlt:
      "Modern business workspace with a laptop dashboard, phone, and analytics charts under soft purple lighting.",
    tldr: [
      "A website is the only digital storefront you fully own — social media accounts can vanish, algorithms shift, but your site stays.",
      "It works 24/7 to build trust, capture leads, rank on Google, and let customers self-serve information about your business.",
      "Modern sites double as growth infrastructure: SEO, analytics, automation, bookings, payments, and integrations that scale with you.",
    ],
    blocks: [
      {
        type: "p",
        text: "If someone told you ten years ago that a small café, salon, clinic, or local shop could compete with established brands online, it would have sounded unrealistic.",
      },
      { type: "p", text: "Today, it isn't just possible — it's expected." },
      {
        type: "p",
        text: "Customers no longer discover businesses the same way they did a decade ago. Recommendations from friends still matter, but the first thing many people do after hearing about a business is search for it online. They want to see what you offer, whether you're trustworthy, how to contact you, and what other customers think.",
      },
      {
        type: "p",
        text: "If they can't find a professional website, they often move on.",
      },
      {
        type: "p",
        text: "Many business owners believe that an Instagram page or Facebook account is enough. While social media is an excellent marketing channel, it should complement your website — not replace it.",
      },
      {
        type: "quote",
        text: "Your website is the only digital property you truly own. Algorithms change. Platforms lose popularity. Accounts get restricted. A website remains your permanent online headquarters.",
      },
      {
        type: "p",
        text: "Let's look at why every small business should invest in one.",
      },

      { type: "h2", text: "Your Website Is Your Digital Storefront" },
      { type: "p", text: "Imagine walking into a busy market." },
      {
        type: "p",
        text: "One shop has clear branding, organized shelves, helpful staff, and visible pricing. The shop next door has no signboard, scattered products, and no one available to answer questions.",
      },
      { type: "p", text: "Which one would you trust?" },
      {
        type: "p",
        text: "Your website creates exactly the same first impression online. Before contacting you, potential customers often ask themselves:",
      },
      {
        type: "ul",
        items: [
          "Is this business legitimate?",
          "Can I trust them?",
          "What services do they provide?",
          "How much experience do they have?",
          "How do I contact them?",
        ],
      },
      {
        type: "p",
        text: "A well-designed website answers all of these questions within seconds.",
      },

      { type: "h2", text: "Social Media Is Not Your Business" },
      {
        type: "p",
        text: "This is one of the biggest misconceptions among small business owners. Many businesses rely entirely on Instagram or Facebook. The problem? You don't own those platforms.",
      },
      { type: "p", text: "Your account can be:" },
      {
        type: "ul",
        items: ["Suspended", "Hacked", "Shadowbanned", "Affected by algorithm changes"],
      },
      { type: "p", text: "Years of work can disappear overnight." },
      {
        type: "p",
        text: "A website gives you complete control over your brand, content, customer experience, and data. Social media should bring visitors to your website — not be your entire online presence.",
      },

      { type: "h2", text: "Customers Expect Professionalism" },
      {
        type: "p",
        text: "Think about your own buying habits. When you discover a business, one of the first things you do is search its name. If all you find is an Instagram page with inconsistent posts and no clear information, confidence drops.",
      },
      { type: "p", text: "A professional website immediately signals:" },
      {
        type: "ul",
        items: ["Credibility", "Stability", "Professionalism", "Transparency"],
      },
      {
        type: "p",
        text: "This matters whether you're a restaurant, dentist, gym, startup, consultant, manufacturer, or law firm.",
      },

      { type: "h2", text: "Your Website Works 24/7" },
      {
        type: "p",
        text: "Unlike a physical office, your website never closes. While you're asleep, it can:",
      },
      {
        type: "ul",
        items: [
          "Answer common questions",
          "Showcase your services",
          "Collect enquiries",
          "Book appointments",
          "Capture leads",
          "Accept payments",
          "Build trust",
        ],
      },
      {
        type: "p",
        text: "Imagine waking up every morning to new enquiries that arrived overnight. That's the advantage of a website designed to generate leads instead of simply displaying information.",
      },

      { type: "h2", text: "Google Is Still the Largest Search Engine" },
      {
        type: "p",
        text: "Millions of searches happen every day. People search for things like \"best dentist near me\", \"website developer in Kolkata\", \"interior designer in Bangalore\", or \"gym membership near me\".",
      },
      {
        type: "p",
        text: "Without a website, your chances of appearing in search results are significantly lower. A website combined with proper SEO can generate visitors for months — or even years — from a single article or service page.",
      },

      { type: "h2", text: "Websites Build Trust Faster" },
      {
        type: "p",
        text: "Trust isn't created by saying you're professional. It's created by demonstrating it. A strong business website can showcase:",
      },
      {
        type: "ul",
        items: [
          "Client testimonials",
          "Portfolio",
          "Certifications and awards",
          "Team members",
          "Case studies",
          "Contact information",
          "Frequently asked questions",
        ],
      },
      {
        type: "p",
        text: "This reduces uncertainty before a customer reaches out.",
      },

      { type: "h2", text: "A Website Helps You Generate Leads" },
      {
        type: "p",
        text: "One of the biggest advantages of a modern website is lead generation. Instead of waiting for phone calls, your website can include:",
      },
      {
        type: "ul",
        items: [
          "Contact forms",
          "WhatsApp integration",
          "Live chat",
          "Appointment booking",
          "Newsletter signup",
          "Quote request forms",
        ],
      },
      {
        type: "p",
        text: "Every visitor becomes a potential customer. Better yet, these enquiries can be automatically sent to your CRM or email so no opportunity is missed.",
      },

      { type: "h2", text: "Mobile Users Come First" },
      {
        type: "p",
        text: "More than half of web traffic now comes from smartphones. A modern website should load quickly, look great on every screen size, be easy to navigate, and make contacting your business effortless. If visitors struggle to use your website on mobile, they'll likely leave.",
      },

      { type: "h2", text: "Speed Matters More Than Ever" },
      {
        type: "p",
        text: "People expect websites to load almost instantly. Every additional second of loading time increases the chance that visitors leave before seeing your content.",
      },
      { type: "p", text: "Performance affects:" },
      {
        type: "ul",
        items: [
          "User experience",
          "SEO",
          "Conversion rates",
          "Customer satisfaction",
        ],
      },
      {
        type: "p",
        text: "Fast websites create better first impressions and keep visitors engaged.",
      },

      { type: "h2", text: "SEO Helps Customers Find You" },
      {
        type: "p",
        text: "Search Engine Optimization (SEO) is the process of making your website easier for search engines to understand. Good SEO includes:",
      },
      {
        type: "ul",
        items: [
          "Helpful content",
          "Clear page structure",
          "Fast loading speed",
          "Mobile responsiveness",
          "Internal linking",
          "Proper metadata",
        ],
      },
      {
        type: "p",
        text: "Over time, SEO can become one of your most cost-effective marketing channels because it continues attracting visitors without paying for every click.",
      },

      { type: "h2", text: "A Website Can Grow With Your Business" },
      {
        type: "p",
        text: "Unlike a printed brochure, a website evolves. As your business grows, you can add:",
      },
      {
        type: "ul",
        items: [
          "New services",
          "Blog articles",
          "Customer reviews",
          "Booking systems",
          "Online payments",
          "AI chatbots",
          "Client portals and dashboards",
          "E-commerce features",
        ],
      },
      {
        type: "p",
        text: "Your website becomes an asset that grows alongside your business.",
      },

      { type: "h2", text: "Automation Saves Time" },
      {
        type: "p",
        text: "Modern websites can automate repetitive tasks — answering FAQs, sending confirmation emails, scheduling appointments, collecting enquiries, generating invoices, and managing customer requests. Automation frees your team to focus on delivering great service rather than handling repetitive administrative work.",
      },

      { type: "h2", text: "Analytics Show What Works" },
      {
        type: "p",
        text: "Without data, you're guessing. Analytics tools can tell you how many people visited, which pages they viewed, how they found you, which content performs best, and where visitors leave. These insights help you make informed marketing decisions instead of relying on assumptions.",
      },

      { type: "h2", text: "Your Competitors Already Have One" },
      {
        type: "p",
        text: "In almost every industry, businesses are investing in their online presence. A professional website is no longer a competitive advantage — it's becoming the baseline expectation. The businesses that stand out combine great design, fast performance, useful content, strong SEO, and clear calls to action.",
      },

      { type: "h2", text: "Common Myths" },
      { type: "h3", text: "\"My customers only use Instagram.\"" },
      {
        type: "p",
        text: "Today's customers often discover businesses through social media — but many still visit a website before making a decision.",
      },
      { type: "h3", text: "\"Websites are expensive.\"" },
      {
        type: "p",
        text: "A website is an investment. When designed well, it can generate enquiries for years. Compared to ongoing advertising costs, a website often delivers long-term value.",
      },
      { type: "h3", text: "\"My business is too small.\"" },
      {
        type: "p",
        text: "Small businesses often benefit the most because a website helps them compete with larger brands. Professional presentation builds confidence regardless of company size.",
      },

      { type: "h2", text: "What Every Business Website Should Include" },
      {
        type: "ul",
        items: [
          "Homepage",
          "About page",
          "Services",
          "Contact page",
          "WhatsApp integration",
          "Google Maps",
          "Testimonials",
          "Portfolio",
          "Mobile responsiveness",
          "Fast loading",
          "SEO-ready structure",
          "Secure hosting",
          "Analytics",
        ],
      },

      { type: "h2", text: "Final Thoughts" },
      {
        type: "p",
        text: "Your website isn't just another marketing expense. It's your digital headquarters. It's where potential customers learn about your business, evaluate your credibility, and decide whether to contact you.",
      },
      {
        type: "p",
        text: "Social media platforms will continue evolving. Algorithms will continue changing. Advertising costs will continue increasing. A well-built website remains one of the few digital assets you truly own.",
      },
      {
        type: "p",
        text: "If you're serious about growing your business, your website should do more than look attractive — it should actively help you generate leads, build trust, and create opportunities every day.",
      },

      { type: "h2", text: "Frequently Asked Questions" },
      { type: "h3", text: "Is a website better than social media?" },
      {
        type: "p",
        text: "They serve different purposes. Social media helps people discover your business, while your website gives them a place to learn, trust, and take action.",
      },
      { type: "h3", text: "How many pages does a small business website need?" },
      {
        type: "p",
        text: "Most small businesses can start with five essential pages: Home, About, Services, Contact, and Privacy Policy. Additional pages can be added as the business grows.",
      },
      { type: "h3", text: "Can a website help generate leads?" },
      {
        type: "p",
        text: "Yes. Features like enquiry forms, WhatsApp integration, appointment booking, and downloadable resources can turn visitors into potential customers.",
      },
      { type: "h3", text: "How often should a website be updated?" },
      {
        type: "p",
        text: "Regular updates to content, security, and performance help keep your website relevant and improve search visibility.",
      },

      { type: "h2", text: "Ready to Build a Website That Works for Your Business?" },
      {
        type: "p",
        text: "At Techilla, we design and develop modern business websites that are fast, mobile-friendly, SEO-ready, and built to support long-term growth.",
      },
      {
        type: "p",
        text: "Whether you're launching a new business or upgrading an existing website, we'll help you create a digital presence that reflects your brand and makes it easier for customers to connect with you. Get in touch at hello@techilla.online to discuss your project.",
      },
    ],
  },
  {
    slug: "brain-tumor-mri-deep-learning",
    title: "Can Deep Learning Spot Brain Tumors the Naked Eye Might Miss?",
    excerpt:
      "An end-to-end PyTorch pipeline that classifies brain MRI scans into four categories — benchmarking a Custom CNN, ResNet50, MobileNetV2 and EfficientNetB0 — deployed as a live Streamlit app.",
    author: "Techilla Studio",
    date: "June 2026",
    readingTime: "6 min read",
    tags: ["Deep Learning", "Medical Imaging", "PyTorch", "Streamlit"],
    heroImage: brainTumorHero,
    heroAlt:
      "Stylized brain MRI with glowing neural-network overlays representing deep learning classification.",
    tldr: [
      "We built an end-to-end PyTorch pipeline that classifies brain MRIs into Glioma, Meningioma, Pituitary, or No Tumor.",
      "Four architectures were benchmarked: a custom CNN, ResNet50, MobileNetV2, and EfficientNetB0 — EfficientNetB0 won on accuracy and recall.",
      "The models ship as a Streamlit web app with drag-and-drop uploads and side-by-side confidence breakdowns; Grad-CAM explainability is next.",
    ],
    blocks: [
      {
        type: "p",
        text: "Medical imaging is one of the most impactful frontiers for artificial intelligence. In radiology, early and accurate classification of brain tumors can drastically alter patient outcomes. But can deep learning models really match — or even enhance — human precision?",
      },
      {
        type: "p",
        text: "To find out, we built a complete, end-to-end deep learning pipeline to classify brain MRI scans into four distinct categories: Glioma, Meningioma, Pituitary, and No Tumor.",
      },
      {
        type: "p",
        text: "Here is a deep dive into how we built, trained, and deployed this multi-model classification system.",
      },
      { type: "h2", text: "The Dataset & Challenge" },
      {
        type: "p",
        text: "The project uses the Brain Tumor MRI Dataset, featuring over 2,500 curated T1-weighted contrast-enhanced MRI images.",
      },
      {
        type: "p",
        text: "While classifying a large tumor might seem straightforward, the real challenge lies in the subtle structural differences between tumor types, varying scan angles, and imaging artifacts.",
      },
      { type: "h3", text: "The Tooling Stack" },
      {
        type: "ul",
        items: [
          "Core DL — PyTorch & Torchvision",
          "Computer Vision — OpenCV",
          "Visualization — Matplotlib & Seaborn",
          "Deployment — Streamlit",
        ],
      },
      { type: "h2", text: "The Contenders: 4 Architectures, 1 Mission" },
      {
        type: "p",
        text: "Instead of relying on a single model, we wanted to benchmark different architectural philosophies. We implemented and trained four distinct convolutional neural networks.",
      },
      { type: "h3", text: "1. Custom CNN" },
      {
        type: "p",
        text: "Built from scratch using standard Convolutional, MaxPool, and Dense layers. Served as our baseline to understand the foundational difficulty of the dataset before applying transfer learning.",
      },
      { type: "h3", text: "2. ResNet50" },
      {
        type: "p",
        text: "A heavyweight champion utilizing residual (skip) connections to mitigate the vanishing gradient problem. Excellent for capturing deep, complex spatial hierarchies in medical images.",
      },
      { type: "h3", text: "3. MobileNetV2" },
      {
        type: "p",
        text: "Optimized for mobile and edge devices using depthwise separable convolutions. Included to test how a lightweight, highly efficient model holds up against medical anomalies.",
      },
      { type: "h3", text: "4. EfficientNetB0" },
      {
        type: "p",
        text: "Uses a unique compound scaling method that balances network depth, width, and resolution uniformly. State-of-the-art balance between parameter efficiency and raw accuracy.",
      },
      { type: "h2", text: "Evaluation: And the Winner Is…" },
      {
        type: "p",
        text: "After rigorous training, validation tuning, and testing, the models were evaluated on an unseen test set. While the Custom CNN provided a solid baseline, transfer learning models pre-trained on ImageNet features significantly outperformed it. Ultimately, EfficientNetB0 emerged as the top performer, striking the perfect balance between high sensitivity (recall) and overall accuracy.",
      },
      {
        type: "quote",
        text: "EfficientNet's compound scaling allows it to focus on minute textural variations in MRI scans that standard custom architectures — or rigidly deep networks like ResNet50 — occasionally overfit or smooth out.",
      },
      { type: "h2", text: "Bringing It to Life: The Streamlit Web App" },
      {
        type: "p",
        text: "Data science shouldn't live in a Jupyter Notebook. To make these models accessible to non-technical users or clinicians looking for a second-opinion tool, we deployed a full Streamlit web application.",
      },
      { type: "h3", text: "Core App Features" },
      {
        type: "ul",
        items: [
          "Drag-and-drop uploads — drop any brain MRI scan (JPG/PNG) directly into the browser.",
          "Side-by-side arena — the app runs inference across all 4 models simultaneously.",
          "Confidence breakdown — interactive probability bars show exactly how confident each model is.",
        ],
      },
      { type: "h3", text: "Watch the Demo" },
      { type: "video", src: brainTumorDemo.url },
      { type: "h2", text: "Setup & How to Run It Locally" },
      {
        type: "p",
        text: "Want to test the models or retrain them on your own data? The entire project is open-source.",
      },
      { type: "h3", text: "1. Clone the repository" },
      {
        type: "code",
        lang: "bash",
        text: "git clone https://github.com/your-username/brain-tumor-mri-classification.git\ncd brain-tumor-mri-classification",
      },
      { type: "h3", text: "2. Install dependencies" },
      { type: "code", lang: "bash", text: "pip install -r requirements.txt" },
      { type: "h3", text: "3. Launch the app" },
      { type: "code", lang: "bash", text: "streamlit run app.py" },
      { type: "h2", text: "What's Next?" },
      {
        type: "p",
        text: "While EfficientNetB0 yielded incredible results, the next phase of this project involves integrating Grad-CAM (Gradient-weighted Class Activation Mapping). This will visually highlight the exact pixels and regions of the MRI the model is looking at — turning our \"black box\" AI into an explainable, trustworthy tool for medical visualization.",
      },
      {
        type: "p",
        text: "What are your thoughts on using deep learning as an assistive tool in radiology? Get in touch — we'd love to discuss.",
      },
    ],
  },
];

export const getPostBySlug = (slug: string) =>
  blogPosts.find((p) => p.slug === slug);
