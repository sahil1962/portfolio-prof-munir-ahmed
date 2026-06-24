export type TestimonialTag =
  | "A-level Physics" | "GCSE" | "A-level Maths" | "Research Methods"
  | "Personalised" | "Maths" | "Physics" | "Engineering" | "11+" | "Higher Education";

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  context: string;
  tags: TestimonialTag[];
  featured: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "sethmi",
    quote: "During my 2nd year of sixth form, I was fortunate enough to have Dr. Munir Ahmed as my physics teacher. He is one of the most supportive and hardworking teachers I have ever had. At the start of my second year, I had doubts about achieving a high grade in A-level Physics, but he provided me with helpful resources and consistent feedback throughout the year, which ultimately led me to achieving an A grade. Dr Ahmed helped me establish a strong foundation in physics, which has helped me secure an offer to pursue a degree in Biomedical Engineering at Imperial College London.",
    author: "Sethmi",
    context: "A-level Physics student",
    tags: ["A-level Physics"],
    featured: true,
  },
  {
    id: "a-ahmed",
    quote: "Studying GCSE Triple Science and A-level Maths with you really helped me achieve the grades necessary to study Medicine and greatly helped me with the BMAT exam. I would not have achieved 100 UMS in C4 Maths without your help.",
    author: "A. Ahmed",
    context: "Medicine and Dentistry, Queen Mary University of London",
    tags: ["GCSE", "A-level Maths"],
    featured: true,
  },
  {
    id: "sy-choudary",
    quote: "Dr Ahmed is a very reliable and helpful tutor. He was always available to answer any questions I had between lessons and is incredibly knowledgeable in his subjects. All lessons were well planned and tailored to me, rather than a one-size-fits-all method. I was given notes at the end of each lesson, which I found very beneficial.",
    author: "S. Y. Choudary",
    context: "Medicine, University of Nottingham",
    tags: ["Personalised"],
    featured: false,
  },
  {
    id: "r-zerrouk",
    quote: "From being a consistent grade D student, the end result became a grade 7, equivalent to a grade A. Not only did my grades improve, but my overall confidence grew through the encouragement of Dr Ahmed.",
    author: "R. Zerrouk",
    context: "St Bonaventure's Sixth Form",
    tags: ["GCSE"],
    featured: false,
  },
  {
    id: "s-choudary",
    quote: "Thanks to Dr Munir, I managed to achieve grade 9 in Maths and an A* in Physics. I found Dr Munir's teaching very accessible and engaging, which really helped me to achieve the best I could in my subjects.",
    author: "S. Choudary",
    context: "Newham Collegiate Sixth Form Centre",
    tags: ["Maths", "Physics"],
    featured: true,
  },
  {
    id: "q-nawaz",
    quote: "The way you taught me GCSE and A-level Maths helped me throughout my academic journey until my PhD.",
    author: "Dr Q. Nawaz",
    context: "University of Oxford",
    tags: ["Maths"],
    featured: false,
  },
  {
    id: "s-liaquat",
    quote: "It was great learning 11+ Maths with you; it helped me to get admission at Cambridge University.",
    author: "S. Liaquat",
    context: "Cambridge University",
    tags: ["11+"],
    featured: false,
  },
  {
    id: "f-azam",
    quote: "I learned BSc Engineering Maths with you, which also enhanced my understanding in other Engineering subjects.",
    author: "F. Azam",
    context: "University College London",
    tags: ["Engineering"],
    featured: false,
  },
  {
    id: "n-javaid",
    quote: "I got A* in A-level Decision Maths and got admission at King's College. Thank you very much for teaching me with great passion and dedication.",
    author: "N. Javaid",
    context: "King's College London",
    tags: ["A-level Maths"],
    featured: false,
  },
  {
    id: "l-sharif",
    quote: "Prof Munir Ahmed is an exceptional educator whose teaching had a lasting impact on my academic journey. He taught me Distributed Systems and Discrete Mathematics with a clarity and patience that made even the most challenging concepts accessible, giving me both the understanding and confidence to tackle difficult material independently. He also served as my industrial supervisor for both my Masters and PhD, bringing real-world perspective to complex theoretical challenges and helping shape the way I approach problems professionally. I am currently working as an academic in the field of Computer Communications Engineering, and I can say without hesitation that the foundations he helped me build have served me well throughout my career. Prof Ahmed has a strong foundation in STEM subjects and I wholeheartedly recommend him as a tutor for any student looking to excel in Mathematics and Physics.",
    author: "Dr Lukman Sharif",
    context: "Academic, Computer Communications Engineering",
    tags: ["Higher Education"],
    featured: true,
  },
];
