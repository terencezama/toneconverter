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
    metaTitle: "Angry to Professional Converter | Rewrite Angry Messages Politely",
    metaDescription:
      "Convert an angry or frustrated message into calm, professional text before you send it. Free to use.",
    h1: "Angry to Professional Converter",
    intro:
      "Wrote a message while frustrated? Paste it below and turn it into something calm and professional before you hit send.",
    body: [
      "Messages written in anger damage relationships and create conflict you then have to clean up. The Angry to Professional Converter rewrites your message so it stays firm and clear, but loses the heat.",
      "Your meaning is preserved. Only the tone changes, and the result is a message you can send to a colleague, client, or manager without wincing later.",
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
    metaTitle: "Casual to Formal Converter | Make Informal Text Business-Ready",
    metaDescription:
      "Turn casual, informal writing into formal business communication with this free casual to formal text converter.",
    h1: "Casual to Formal Converter",
    intro:
      "Turn relaxed, informal writing into polished, business-ready communication suitable for emails, reports, and official documents.",
    body: [
      "Casual language is fine between friends, but it undermines your credibility in professional settings. This converter rewrites slang, contractions, and informal phrasing into formal business language.",
      "Use it for job applications, client emails, official requests, or any message where the first impression matters.",
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
    metaTitle: "Friendly Tone Converter | Make Your Messages Warmer",
    metaDescription:
      "Rewrite stiff or cold messages into warm, approachable text with this free friendly tone converter.",
    h1: "Friendly Tone Converter",
    intro:
      "Make stiff or overly formal messages feel warm and human without losing professionalism.",
    body: [
      "Sometimes a message is technically correct but reads cold. The Friendly Tone Converter adds warmth while keeping your meaning intact.",
      "It works well for welcoming new team members, customer replies, community posts, and everyday workplace chat.",
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
    metaTitle: "Professional Tone Converter | Rewrite Any Text Professionally",
    metaDescription:
      "Rewrite any message in a clear, professional tone. Free tone converter for emails and workplace communication.",
    h1: "Professional Tone Converter",
    intro:
      "Rewrite any message in a clear, professional tone. Built for emails, workplace chat, and client communication.",
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
    metaTitle: "Sentence Clarifier | Make Messy Sentences Easy to Read",
    metaDescription:
      "Paste messy, confusing or rushed sentences and get back clear, well-structured text. Free sentence clarifier.",
    h1: "Sentence Clarifier",
    intro:
      "Paste messy, rushed, or confusing sentences and get back text that says what you meant, clearly.",
    body: [
      "Unclear writing creates confusion, follow-up questions, and mistakes. The Sentence Clarifier restructures your text so the main point comes through immediately.",
      "It fixes rambling sentences, tangled grammar, and unclear phrasing while preserving everything you meant to say.",
    ],
    presetTone: "clearer",
    example: {
      before:
        "so basically what happened was the thing we talked about before with the files it didn't work again like last time",
      after:
        "The file issue we discussed earlier has come up again. It looks like the same problem as last time.",
    },
  },
  {
    slug: "text-rewriter",
    navLabel: "Text Rewriter",
    metaTitle: "Text Rewriter | Rewrite Any Message in a Better Tone",
    metaDescription:
      "Free text rewriter. Make any message more professional, more friendly, shorter, longer, or simply clearer.",
    h1: "Text Rewriter",
    intro:
      "Pick a tone and get a cleaner, better-phrased version of your message.",
    body: [
      "The Text Rewriter takes what you wrote and gives you a better-phrased version, in whatever direction you need: more professional, more friendly, shorter, or just clearer.",
      "It's also handy for making AI-assisted drafts read like a person wrote them.",
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
    metaTitle: "Message Tone Changer | Change How Any Message Sounds",
    metaDescription:
      "Change the tone of any message. Make texts calmer, friendlier, more professional, or more confident with this free tone changer.",
    h1: "Message Tone Changer",
    intro:
      "Make any message calmer, friendlier, more confident, or more empathetic with one click.",
    body: [
      "The same words can land very differently depending on tone. The Message Tone Changer lets you rewrite a single message in multiple styles until it sounds exactly right.",
      "Try Professional for work, Friendly for communities, Calm for tense conversations, or Empathetic for sensitive topics.",
    ],
    presetTone: "calm",
    example: {
      before: "you were supposed to fix this yesterday, why is it still broken??",
      after:
        "I noticed the issue is still occurring, though I understood a fix was planned for yesterday. Could you let me know the current status and when it should be resolved?",
    },
  },
  {
    slug: "email-tone-converter",
    navLabel: "Email Tone Converter",
    metaTitle: "Email Tone Converter | Write Better, More Professional Emails",
    metaDescription:
      "Convert rough email drafts into clear, professional emails with this free email tone converter.",
    h1: "Email Tone Converter",
    intro:
      "Turn rough email drafts into clear, professional emails that get the response you want.",
    body: [
      "Email tone is easy to misread. What feels direct to you can land as rude on the other end. The Email Tone Converter rewrites your draft so it reads the way you intended it.",
      "Use it for follow-ups, complaints, requests, apologies, and any email that needs to strike the right balance.",
    ],
    presetTone: "professional",
    example: {
      before: "Still waiting on the invoice. Send it over.",
      after:
        "I hope you're well. I wanted to follow up on the invoice. Could you send it over when you get a chance? Thank you!",
    },
  },
];

export function getUseCase(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}
