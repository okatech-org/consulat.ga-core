import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY is not set')
        }

        const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-realtime-preview-2024-12-17',
                voice: 'verse',
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('OpenAI API Error:', data)
            throw new Error(`OpenAI API Error: ${data.error?.message || 'Unknown error'}`)
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
