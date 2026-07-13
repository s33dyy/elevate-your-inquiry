import brainTumorDemo from "@/assets/brain-tumor-demo.mov.asset.json";

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang?: string; text: string }
  | { type: "video"; src: string; poster?: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readingTime: string;
  tags: string[];
  blocks: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "brain-tumor-mri-deep-learning",
    title: "Can Deep Learning Spot Brain Tumors the Naked Eye Might Miss?",
    excerpt:
      "An end-to-end PyTorch pipeline that classifies brain MRI scans into four categories — benchmarking a Custom CNN, ResNet50, MobileNetV2 and EfficientNetB0 — deployed as a live Streamlit app.",
    author: "Techilla Studio",
    date: "June 2026",
    readingTime: "6 min read",
    tags: ["Deep Learning", "Medical Imaging", "PyTorch", "Streamlit"],
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
