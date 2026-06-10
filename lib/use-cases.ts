import type { ToneId } from "./tones";

export type UseCase = {
  slug: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  body: string[];
  presetTone: ToneId;
  example: { before: string; after: string };
};

export const USE_CASES: UseCase[] = [
  {
    slug: "angry-to-professional",
    navLabel: "Angry to Professional",
    metaTitle: "Angry to Professional Converter — Rewrite Angry Messages Politely",
    metaDescription:
      "Convert angry or frustrated messages into calm, polite, professional text in seconds. Free angry to professional tone converter.",
    h1: "Angry to Professional Converter",
    intro:
      "Wrote a message while frustrated? Paste it below and convert it into calm, polite, professional language before you hit send.",
    body: [
      "Messages written in anger can damage relationships, offend clients, and create unnecessary conflict. The Angry to Professional Converter rewrites your message so it stays firm and clear, but loses the heat.",
      "Your meaning is preserved — only the tone changes. The result is a message you can confidently send to a colleague, client, or manager.",
    ],
    presetTone: "professional",
    example: {
      before: "I'm tired of you ignoring my emails. This is unacceptable.",
      after:
        "I wanted to follow up as I have not yet received a response to my previous emails. I would appreciate an update when possible, as this matter is important.",
    },
  },
  {
    slug: "casual-to-formal",
    navLabel: "Casual to Formal",
    metaTitle: "Casual to Formal Converter — Make Informal Text Business-Ready",
    metaDescription:
      "Turn casual, informal writing into formal, business-ready communication instantly with our free casual to formal text converter.",
    h1: "Casual to Formal Converter",
    intro:
      "Turn relaxed, informal writing into polished, business-ready communication suitable for emails, reports, and official documents.",
    body: [
      "Casual language is great between friends, but it can undermine your credibility in professional settings. This converter rewrites slang, contractions, and informal phrasing into formal business language.",
      "Use it for job applications, client emails, official requests, and any message where first impressions matter.",
    ],
    presetTone: "formal",
    example: {
      before: "hey, can u send me that report asap? thx",
      after:
        "Hello, could you please send me the report at your earliest convenience? Thank you very much.",
    },
  },
  {
    slug: "friendly-tone-converter",
    navLabel: "Friendly Tone Converter",
    metaTitle: "Friendly Tone Converter — Make Your Messages Warm and Approachable",
    metaDescription:
      "Rewrite stiff or cold messages into warm, friendly, approachable text with our free friendly tone converter.",
    h1: "Friendly Tone Converter",
    intro:
      "Make stiff or overly formal messages feel warm, human, and approachable without losing professionalism.",
    body: [
      "Sometimes a message is technically correct but feels cold or robotic. The Friendly Tone Converter adds warmth and approachability while keeping your meaning intact.",
      "Perfect for welcoming new team members, customer messages, community posts, and everyday workplace chat.",
    ],
    presetTone: "friendly",
    example: {
      before: "Your request has been received and will be processed in due course.",
      after:
        "Thanks so much for reaching out! We've got your request and we'll get back to you very soon.",
    },
  },
  {
    slug: "professional-tone-converter",
    navLabel: "Professional Tone Converter",
    metaTitle: "Professional Tone Converter — Rewrite Any Text Professionally",
    metaDescription:
      "Instantly rewrite any message in a clear, polite, professional tone. Free professional tone converter for emails and workplace communication.",
    h1: "Professional Tone Converter",
    intro:
      "Rewrite any message in a clear, polite, professional tone — ideal for emails, workplace chat, and client communication.",
    body: [
      "Professional communication builds trust. This converter takes rough, rushed, or emotional drafts and rewrites them into polished, professional messages.",
      "It keeps your intent and key points while improving structure, word choice, and tone.",
    ],
    presetTone: "professional",
    example: {
      before: "this deadline is impossible, there's no way we can do this",
      after:
        "I have some concerns about the current deadline. Based on our capacity, I believe we may need additional time, and I would welcome a discussion about adjusting the timeline.",
    },
  },
  {
    slug: "sentence-clarifier",
    navLabel: "Sentence Clarifier",
    metaTitle: "Sentence Clarifier — Make Messy Sentences Clear and Easy to Read",
    metaDescription:
      "Paste messy, confusing, or rushed sentences and get clear, well-structured text instantly with our free sentence clarifier.",
    h1: "Sentence Clarifier",
    intro:
      "Paste messy, rushed, or confusing sentences and get back clear, well-structured text that's easy to understand.",
    body: [
      "Unclear writing creates confusion, follow-up questions, and mistakes. The Sentence Clarifier restructures your text so the main point comes through immediately.",
      "It fixes rambling sentences, tangled grammar, and unclear phrasing while preserving everything you meant to say.",
    ],
    presetTone: "clearer",
    example: {
      before:
        "so basically what happened was the thing we talked about before with the files it didn't work again like last time",
      after:
        "The file issue we discussed earlier has occurred again — the same problem as last time.",
    },
  },
  {
    slug: "text-rewriter",
    navLabel: "Text Rewriter",
    metaTitle: "Text Rewriter — Rewrite Any Message in a Better Tone",
    metaDescription:
      "Free AI text rewriter. Rewrite any message to be more professional, friendly, formal, clear, shorter, or longer in seconds.",
    h1: "Text Rewriter",
    intro:
      "Rewrite any text in seconds — choose a tone and get a cleaner, better-phrased version of your message instantly.",
    body: [
      "Whether you need a message to sound more professional, more friendly, shorter, or simply clearer, the Text Rewriter gives you a better version while keeping your meaning.",
      "It also helps make AI-assisted writing sound more natural, clear, and human.",
    ],
    presetTone: "clearer",
    example: {
      before: "we need the budget numbers from you it's urgent pls send today",
      after:
        "Could you please send the budget numbers today? This is time-sensitive, so your prompt help would be greatly appreciated.",
    },
  },
  {
    slug: "message-tone-changer",
    navLabel: "Message Tone Changer",
    metaTitle: "Message Tone Changer — Change the Tone of Any Message Instantly",
    metaDescription:
      "Change the tone of any message instantly. Make texts calmer, friendlier, more professional, or more confident with our free message tone changer.",
    h1: "Message Tone Changer",
    intro:
      "Change the tone of any message — make it calmer, friendlier, more confident, or more empathetic with one click.",
    body: [
      "The same words can land very differently depending on tone. The Message Tone Changer lets you rewrite a single message in multiple styles until it sounds exactly right.",
      "Try Professional for work, Friendly for communities, Calm for tense conversations, or Empathetic for sensitive topics.",
    ],
    presetTone: "calm",
    example: {
      before: "you were supposed to fix this yesterday, why is it still broken??",
      after:
        "I noticed the issue is still occurring — I understood it was planned for yesterday. Could you let me know the current status and when a fix is expected?",
    },
  },
  {
    slug: "email-tone-converter",
    navLabel: "Email Tone Converter",
    metaTitle: "Email Tone Converter — Write Better, More Professional Emails",
    metaDescription:
      "Convert rough email drafts into clear, polite, professional emails instantly with our free email tone converter.",
    h1: "Email Tone Converter",
    intro:
      "Turn rough email drafts into clear, polite, professional emails that get the response you want.",
    body: [
      "Email tone is easy to misread — what feels direct to you can feel rude to your reader. The Email Tone Converter rewrites your draft so it reads exactly the way you intend.",
      "Use it for follow-ups, complaints, requests, apologies, and any email that needs to strike the right balance.",
    ],
    presetTone: "professional",
    example: {
      before: "Still waiting on the invoice. Send it over.",
      after:
        "I hope you're well. I wanted to kindly follow up on the invoice — could you send it over when you get a chance? Thank you!",
    },
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
