import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe is not configured');
    }

    const { 
      invoiceId, 
      invoiceNumber, 
      amount, 
      currency,
      clientName,
      clientAddress,
      description,
      successUrl,
      cancelUrl 
    } = await req.json();

    console.log('Creating checkout session for invoice:', invoiceNumber, 'amount:', amount, 'currency:', currency);

    if (!invoiceId || !amount || !successUrl || !cancelUrl) {
      throw new Error('Missing required fields');
    }

    // Convert to cents/smallest currency unit
    const amountInCents = Math.round(amount * 100);
    
    // Stripe supports limited currencies - default to USD if currency not supported
    const stripeCurrency = (currency || 'usd').toLowerCase();

    // Build product name with invoice number and client details
    const clientInfo = clientName ? `Invoice for: ${clientName}${clientAddress ? ` ${clientAddress}` : ''}` : '';
    const productName = `Invoice ${invoiceNumber}${clientInfo ? `, ${clientInfo}` : ''}`;

    // Build form params
    const params = new URLSearchParams({
      'payment_method_types[0]': 'card',
      'line_items[0][price_data][currency]': stripeCurrency,
      'line_items[0][price_data][product_data][name]': productName,
      'line_items[0][price_data][product_data][description]': description || `Payment for CEPA Invoice ${invoiceNumber}`,
      'line_items[0][price_data][unit_amount]': amountInCents.toString(),
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': `${successUrl}?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}&invoice_number=${invoiceNumber}`,
      'cancel_url': `${cancelUrl}?invoice_id=${invoiceId}`,
      'metadata[invoice_id]': invoiceId,
      'metadata[invoice_number]': invoiceNumber,
      'metadata[client_name]': clientName || '',
      'metadata[client_address]': clientAddress || '',
    });

    // Add customer details for display on checkout page
    if (clientName) {
      params.append('payment_intent_data[description]', `Payment from ${clientName}${clientAddress ? ` - ${clientAddress}` : ''}`);
      params.append('custom_text[submit][message]', `Invoice for: ${clientName}${clientAddress ? `\n${clientAddress}` : ''}`);
    }

    // Use native fetch instead of Stripe SDK
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const session = await response.json();

    if (!response.ok) {
      console.error('Stripe error:', session);
      throw new Error(session.error?.message || 'Failed to create checkout session');
    }

    console.log('Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
