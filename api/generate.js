export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { systemPrompt, userPrompt } = req.body

  if (!userPrompt) {
    return res.status(400).json({ error: 'No prompt provided' })
  }

  // Check the key is being picked up
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not found in environment' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    const data = await response.json()

    // Log the full response so we can see any errors
    console.log('Anthropic response:', JSON.stringify(data, null, 2))

    if (data.error) {
      return res.status(500).json({ error: data.error.message })
    }

    res.status(200).json({ result: data.content[0].text })

  } catch (error) {
    console.error('Fetch error:', error)
    res.status(500).json({ error: error.message })
  }
}