import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe is not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    console.log('Verifying payment for session:', sessionId);

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Payment not completed',
          status: session.payment_status 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get invoice details from metadata
    const invoiceId = session.metadata?.invoice_id;
    const invoiceNumber = session.metadata?.invoice_number;
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

    console.log('Payment verified for invoice:', invoiceNumber, 'Amount:', amountPaid);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the financial transaction if it exists
    const { error: updateError } = await supabase
      .from('financial_transactions')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: 'stripe',
        payment_reference: session.payment_intent as string,
      })
      .eq('transaction_number', invoiceNumber);

    if (updateError) {
      console.log('Note: Could not update financial_transactions:', updateError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully',
        invoiceId,
        invoiceNumber,
        amountPaid,
        paymentIntent: session.payment_intent,
        receiptUrl: session.receipt_url || null,
        customerEmail: session.customer_details?.email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
