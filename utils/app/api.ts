// /utils/app/api.ts
export const approveQuote = async (quoteId: number): Promise<void> => {
  const response = await fetch(`/api/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'approve',
      quoteId: quoteId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to approve quote');
  }
};


export const unapproveQuote = async (quoteId: number): Promise<void> => {
  const response = await fetch(`/api/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'unapprove',
      quoteId: quoteId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to unapprove quote');
  }
};
