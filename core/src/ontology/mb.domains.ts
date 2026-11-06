/**
 * MB application ontology.
 * Same OntologyNode / OntologyAttribute shape as notention9 core/src/ontology/domains.ts.
 * Classes are the 12 interaction primitives. Templates and scenarios are not classes.
 */

export interface OntologyAttribute {
  type: string;
  description?: string;
  icon?: string;
  operators: { real: string[]; imaginary: string[] };
  options?: string[];
  aliases?: string[];
  referenceType?: string;
}

export interface OntologyNode {
  id: string;
  label: string;
  description?: string;
  requiredAttributes?: string[];
  attributes?: Record<string, OntologyAttribute>;
  children?: OntologyNode[];
  actionLabel?: string;
  extends?: string[];
}

const attr = (
  type: string,
  description: string,
  real: string[],
  imaginary: string[],
  extra: Partial<OntologyAttribute> = {}
): OntologyAttribute => ({
  type,
  description,
  operators: { real, imaginary },
  ...extra,
});

export const mbDomain: OntologyNode[] = [
  {
    id: 'mb',
    label: 'MonkeyBusiness',
    description: 'Application ontology for Situation-first coordination.',
    children: [
      {
        id: 'situation',
        label: 'Situation',
        description: 'Constraint root. The human unit of work. Formerly Request.',
        actionLabel: 'Publish Situation',
        requiredAttributes: ['summary'],
        attributes: {
          summary: attr('string', 'Human summary of the situation', ['is'], ['contains']),
          target: attr('enum', 'network or identity', ['is'], ['is not'], { options: ['network', 'identity'] }),
          locus: attr('geo', 'Where the situation is', ['is'], ['near'], { aliases: ['loc', 'location'] }),
          what3words: attr(
            'what3words',
            'One 3 m square. Value is word1.word2.word3. Exact only. Do not split the words.',
            ['is'],
            []
          ),
          needBy: attr('datetime', 'When it is needed', ['is'], ['before', 'after']),
          budget: attr('number', 'Budget ceiling', ['is'], ['less than', 'greater than']),
          mood: attr('enum', 'Inferred or stated mood', ['is'], ['is not'], {
            options: ['calm', 'hungry', 'anxious', 'pensive', 'frustrated', 'urgent'],
          }),
          urgency: attr('enum', 'Urgency', ['is'], ['is not'], { options: ['low', 'normal', 'high', 'now'] }),
        },
      },
      {
        id: 'offer',
        label: 'Offer',
        description: 'Fact root. Listing or counter.',
        actionLabel: 'Publish Offer',
        requiredAttributes: ['role'],
        attributes: {
          role: attr('enum', 'listing or counter', ['is'], ['is not'], { options: ['listing', 'counter'] }),
          price: attr('number', 'Price or rate', ['is'], ['less than', 'greater than'], { aliases: ['$'] }),
          locus: attr('geo', 'Where the offer applies', ['is'], ['near']),
          what3words: attr(
            'what3words',
            'One 3 m square. Value is word1.word2.word3. Exact only. Do not split the words.',
            ['is'],
            []
          ),
          rails: attr('string', 'Accepted settlement rails', ['is'], ['contains']),
        },
      },
      {
        id: 'conversation',
        label: 'Conversation',
        description: 'Channel linked to a Situation.',
        attributes: {
          situationId: attr('string', 'Linked Situation', ['is'], ['is not'], { referenceType: 'situation' }),
        },
      },
      {
        id: 'message',
        label: 'Message',
        description: 'Channel atom. May attach any primitive.',
        attributes: {
          body: attr('string', 'Message body', ['is'], ['contains']),
          intent: attr('enum', 'Optional intent', ['is'], ['is not'], {
            options: ['endorsement_request', 'counter', 'note'],
          }),
        },
      },
      {
        id: 'agreement',
        label: 'Agreement',
        description: 'Signed terms. Aim of negotiation, not a gate.',
        attributes: {
          terms: attr('string', 'Terms summary', ['is'], ['contains']),
          validDuring: attr('string', 'Validity window', ['is'], ['contains']),
        },
      },
      {
        id: 'engagement',
        label: 'Engagement',
        description: 'Transition. Phase is a cache.',
        attributes: {
          phase: attr('enum', 'Cached phase', ['is'], ['is not'], {
            options: ['proposed', 'active', 'settled', 'disputed', 'closed'],
          }),
        },
      },
      {
        id: 'event',
        label: 'Event',
        description: 'Schedule. kind=meeting for point-to-point.',
        attributes: {
          kind: attr('enum', 'Event kind', ['is'], ['is not'], { options: ['meeting', 'habit-window', 'deadline'] }),
          start: attr('datetime', 'Start', ['is'], ['before', 'after']),
        },
      },
      {
        id: 'invoice',
        label: 'Invoice',
        description: 'Value request. Estimate is the first instance.',
        attributes: {
          amount: attr('number', 'Amount', ['is'], ['less than', 'greater than']),
          predecessor: attr('string', 'Prior invoice in the replacement chain', ['is'], ['is not']),
        },
      },
      {
        id: 'payment',
        label: 'Payment',
        description: 'Settlement reference. Always accepted.',
        attributes: {
          amount: attr('number', 'Amount', ['is'], ['is']),
          rail: attr('string', 'Settlement rail', ['is'], ['is not']),
        },
      },
      {
        id: 'receipt',
        label: 'Receipt',
        description: 'Private attestation. Default private.',
        attributes: {
          paymentId: attr('string', 'Payment referenced', ['is'], ['is not'], { referenceType: 'payment' }),
        },
      },
      {
        id: 'endorsement',
        label: 'Endorsement',
        description: 'Optional indexable attestation. Not a global score.',
        attributes: {
          subject: attr('string', 'What is endorsed', ['is'], ['is not']),
          weight: attr('number', 'Weight', ['is'], ['greater than', 'less than']),
        },
      },
      {
        id: 'dispute',
        label: 'Dispute',
        description: 'Governance. Any subject.',
        attributes: {
          subject: attr('string', 'Disputed object', ['is'], ['is not']),
          reason: attr('string', 'Reason', ['is'], ['contains']),
        },
      },
    ],
  },
];

export const MB_CLASS_IDS = mbDomain[0].children?.map((n) => n.id) ?? [];
