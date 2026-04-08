// ─── Agent System Prompts ───────────────────────────────────────────

const agents = {
    research: `You are a senior UX researcher specializing in fintech products. 
  Your job is to analyze a financial product description and return:
  - Target audience and their core needs
  - Key UX principles that apply to this product
  - Trust and compliance considerations specific to fintech
  - 3 competitor products to reference for inspiration
  Be concise, specific, and actionable. Format your response with clear sections.`,
  
    design: `You are a senior product designer specializing in fintech apps.
  You will receive a product description and UX research. Your job is to return:
  - Recommended color palette (primary, secondary, accent, background, text) with hex codes
  - Typography recommendations (heading font, body font, sizing scale)
  - Key UI components this product needs
  - Overall visual tone and mood
  - Layout recommendations for the main screen
  Be specific and explain why each choice fits a fintech product. Format with clear sections.`,
  
    copy: `You are a UX copywriter specializing in financial products.
  You will receive a product description and design direction. Your job is to write:
  - App name suggestion with rationale
  - Tagline (under 8 words)
  - Onboarding headline and subheading
  - 3 key feature descriptions (short, benefit-focused)
  - Empty state message (for when users have no data yet)
  - Primary CTA button text for the main action
  Write in a tone that is clear, trustworthy, and approachable — never salesy.`,
  
    review: `You are a senior design director reviewing a fintech product concept.
  You will receive the full design brief including research, visual direction, and copy.
  Your job is to:
  - Identify the 3 strongest aspects of this concept
  - Flag 2 potential problems or risks
  - Give 3 specific actionable improvements
  - Give an overall readiness score out of 10 with one sentence of reasoning
  Be honest, direct, and constructive. Format with clear sections.`
  }
  
  // ─── Call a Single Agent ─────────────────────────────────────────────
  
  async function callAgent(agentName, userPrompt) {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: agents[agentName],
        userPrompt
      })
    })
  
    const data = await response.json()
  
    if (data.error) throw new Error(data.error)
    return data.result
  }
  
  // ─── Update UI Helper ────────────────────────────────────────────────
  
  function updateCard(cardId, contentId, text) {
    const content = document.getElementById(contentId)
    content.textContent = text
    content.classList.add('active')
  }
  
  // ─── Main Agent Pipeline ─────────────────────────────────────────────
  
  async function runAgents(userInput) {
    const btn = document.getElementById('generateBtn')
    const output = document.getElementById('output')
  
    // Show output section and disable button
    output.style.display = 'block'
    btn.disabled = true
    btn.textContent = 'Generating...'
  
    // Reset all cards
    document.getElementById('researchOutput').textContent = 'Working...'
    document.getElementById('designOutput').textContent = 'Waiting...'
    document.getElementById('copyOutput').textContent = 'Waiting...'
    document.getElementById('reviewOutput').textContent = 'Waiting...'
  
    try {
  
      // Agent 1 — Research
      const researchResult = await callAgent('research', 
        `Analyze this fintech product: ${userInput}`
      )
      updateCard('researchCard', 'researchOutput', researchResult)
  
      // Agent 2 — Design (receives research output)
      document.getElementById('designOutput').textContent = 'Working...'
      const designResult = await callAgent('design',
        `Product description: ${userInput}\n\nUX Research: ${researchResult}`
      )
      updateCard('designCard', 'designOutput', designResult)
  
      // Agent 3 — Copy (receives research + design output)
      document.getElementById('copyOutput').textContent = 'Working...'
      const copyResult = await callAgent('copy',
        `Product description: ${userInput}\n\nUX Research: ${researchResult}\n\nDesign Direction: ${designResult}`
      )
      updateCard('copyCard', 'copyOutput', copyResult)
  
      // Agent 4 — Review (receives everything)
      document.getElementById('reviewOutput').textContent = 'Working...'
      const reviewResult = await callAgent('review',
        `Product description: ${userInput}\n\nUX Research: ${researchResult}\n\nDesign Direction: ${designResult}\n\nInterface Copy: ${copyResult}`
      )
      updateCard('reviewCard', 'reviewOutput', reviewResult)
  
    } catch (error) {
      alert('Something went wrong: ' + error.message)
    } finally {
      btn.disabled = false
      btn.textContent = 'Generate Design Concept'
    }
  }
  
  // ─── Event Listener ──────────────────────────────────────────────────
  
  document.getElementById('generateBtn').addEventListener('click', () => {
    const userInput = document.getElementById('userInput').value.trim()
  
    if (!userInput) {
      alert('Please describe your fintech product first.')
      return
    }
  
    runAgents(userInput)
  })