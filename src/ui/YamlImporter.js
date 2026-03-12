/**
 * YAML frontmatter ↔ form state converter
 *
 * Format:
 *   ---
 *   title: "..."
 *   ...
 *   outcomes:
 *     - name: "..."
 *   ---
 *   <!-- Everything below is free-text notes and will NOT appear in the Visual Abstract -->
 */

// ── Serializer: state → markdown with YAML frontmatter ──────────────────────

export function stateToMarkdown(state) {
  const outcomes = (state.outcomes || []).map(o => {
    const isCont = o.type === 'continuous'
    const lines = [
      `  - name: ${yamlStr(o.name)}`,
      `    type: ${o.type || 'dichotomous'}        # dichotomous | continuous`,
      `    measure: ${o.measureType || 'RR'}        # RR | OR (dichotomous) / MD | SMD (continuous)`,
      `    effect: ${yamlStr(o.effectValue)}`,
      `    ci: ${yamlStr(o.ci_95)}`,
      `    detail: ${yamlStr(o.detail || '')}`,
    ]
    if (isCont) {
      lines.push(`    unit: ${yamlStr(o.unit)}        # unit label shown after outcome name`)
    } else {
      lines.push(`    cer: ${yamlStr(o.cer)}        # control event rate e.g. "17 per 100"`)
    }
    lines.push(`    direction: ${o.direction || 'unclear'}  # favors_intervention | favors_control | unclear`)
    lines.push(`    certainty: ${o.certainty || 'moderate'} # high | moderate | low | very_low`)
    if (o.nStudies)      lines.push(`    k: ${o.nStudies}`)
    if (o.nParticipants) lines.push(`    n: ${o.nParticipants}`)
    return lines.join('\n')
  }).join('\n')

  const conclusionLines = (state.conclusion || '')
    .split('\n')
    .map(l => `  ${l}`)
    .join('\n')

  const parts = [
    '---',
    `title: ${yamlStr(state.title || '')}`,
    `authors: ${yamlStr(state.authors || '')}`,
    `journal: ${yamlStr(state.journal || '')}`,
    `year: ${yamlStr(state.year || '')}`,
    `doi: ${yamlStr(state.doi || '')}`,
    `jama_findings_mode: ${state.jamaFindingsMode || 'donut'}`,
    ``,
    `study_design:`,
    `  type: ${yamlStr(state.studyDesignType || '')}`,
    `  detail: ${yamlStr(state.studyDesignDetail || '')}`,
    ``,
    `population: ${yamlStr(state.population || '')}`,
    `population_detail: ${yamlStr(state.populationDetail || '')}`,
    ``,
    `intervention: ${yamlStr(state.intervention || '')}`,
    `intervention_abbr: ${yamlStr(state.interventionAbbr || '')}`,
    `intervention_detail: ${yamlStr(state.interventionDetail || '')}`,
    `comparator: ${yamlStr(state.comparator || '')}`,
    `comparator_detail: ${yamlStr(state.comparatorDetail || '')}`,
    ``,
    `conclusion: >`,
    conclusionLines || `  `,
    `key_limitations: ${yamlStr(state.keyLimitations || '')}`,
    ``,
    outcomes ? `outcomes:\n${outcomes}` : `outcomes: []`,
    '---',
    '',
    '<!-- Everything below this line will NOT appear in the Visual Abstract. Use freely for notes. -->',
    '',
    '## Notes',
    '',
    '',
  ]
  return parts.join('\n')
}

function yamlStr(s) {
  s = String(s ?? '')
  if (!s) return '""'
  // Always quote to be safe with special characters
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

// ── Parser: markdown with YAML frontmatter → partial preset ─────────────────

export function markdownToPreset(text) {
  const fm = extractFrontmatter(text)
  if (!fm) return null

  const preset = {}

  // Simple string fields
  const strMap = {
    title:               'title',
    authors:             'authors',
    journal:             'journal',
    year:                'year',
    doi:                 'doi',
    population:          'population',
    population_detail:   'populationDetail',
    intervention:        'intervention',
    intervention_abbr:   'interventionAbbr',
    intervention_detail: 'interventionDetail',
    comparator:          'comparator',
    comparator_detail:   'comparatorDetail',
    jama_findings_mode:  'jamaFindingsMode',
    conclusion:          'conclusion',
    key_limitations:     'keyLimitations',
  }
  for (const [yamlKey, stateKey] of Object.entries(strMap)) {
    if (fm[yamlKey] !== undefined && fm[yamlKey] !== null) {
      preset[stateKey] = String(fm[yamlKey])
    }
  }

  // study_design nested object
  if (fm.study_design && typeof fm.study_design === 'object') {
    if (fm.study_design.type)   preset.studyDesignType   = String(fm.study_design.type)
    if (fm.study_design.detail) preset.studyDesignDetail = String(fm.study_design.detail)
  }

  // outcomes array
  if (Array.isArray(fm.outcomes)) {
    preset.outcomes = fm.outcomes.map(o => ({
      name:          String(o.name || ''),
      type:          String(o.type || 'dichotomous'),
      measureType:   String(o.measure || (o.type === 'continuous' ? 'MD' : 'RR')),
      effectValue:   String(o.effect || ''),
      ci_95:         String(o.ci || ''),
      cer:           String(o.cer || ''),
      unit:          String(o.unit || ''),
      detail:        String(o.detail || ''),
      direction:     String(o.direction || 'unclear'),
      certainty:     String(o.certainty || 'moderate'),
      nStudies:      o.k !== undefined && o.k !== '' ? String(o.k) : '',
      nParticipants: o.n !== undefined && o.n !== '' ? String(o.n) : '',
      primary:       false,
    }))
  }

  return preset
}

// ── Internal parser ──────────────────────────────────────────────────────────

function extractFrontmatter(text) {
  // Match --- ... --- at start of document
  const match = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return null
  return parseYaml(match[1])
}

function parseYaml(src) {
  const lines = src.split(/\r?\n/)
  const result = {}
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    if (!raw.trim() || raw.trim().startsWith('#')) { i++; continue }

    // Must be a top-level key (no leading space)
    const m = raw.match(/^([\w][\w_]*):\s*(.*)$/)
    if (!m) { i++; continue }

    const key  = m[1]
    const rest = stripInlineComment(m[2]).trim()

    if (rest === '>') {
      // Folded block scalar: collect indented lines, join with space
      i++
      const parts = []
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        if (lines[i].trim()) parts.push(lines[i].trim())
        i++
      }
      result[key] = parts.join(' ')
      continue
    }

    if (rest === '' || rest === '|') {
      // Nested block: collect 2-space-indented lines
      i++
      const children = []
      while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
        if (lines[i].trim()) children.push(lines[i])
        i++
      }
      if (children.length > 0 && children[0].match(/^  -/)) {
        result[key] = parseYamlArray(children)
      } else {
        result[key] = parseYamlObject(children)
      }
      continue
    }

    result[key] = parseScalar(rest)
    i++
  }

  return result
}

function parseYamlArray(lines) {
  const items = []
  let current = null

  for (const line of lines) {
    const arrStart = line.match(/^  -\s*(.*)$/)
    if (arrStart) {
      if (current) items.push(current)
      current = {}
      const firstField = stripInlineComment(arrStart[1]).trim()
      if (firstField) {
        const kv = firstField.match(/^([\w][\w_]*):\s*(.*)$/)
        if (kv) current[kv[1]] = parseScalar(stripInlineComment(kv[2]))
      }
    } else if (current !== null) {
      const kv = line.trim().match(/^([\w][\w_]*):\s*(.*)$/)
      if (kv) current[kv[1]] = parseScalar(stripInlineComment(kv[2]))
    }
  }
  if (current) items.push(current)
  return items
}

function parseYamlObject(lines) {
  const obj = {}
  for (const line of lines) {
    const kv = line.trim().match(/^([\w][\w_]*):\s*(.*)$/)
    if (kv) obj[kv[1]] = parseScalar(stripInlineComment(kv[2]))
  }
  return obj
}

function stripInlineComment(s) {
  // Remove trailing # comment, but not inside quotes
  return s.replace(/\s+#(?:[^"']|$).*$/, '')
}

function parseScalar(s) {
  s = (s || '').trim()
  if (!s) return ''
  if (s.startsWith('"') && s.endsWith('"'))
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  if (s.startsWith("'") && s.endsWith("'"))
    return s.slice(1, -1).replace(/''/g, "'")
  if (s === 'true')  return true
  if (s === 'false') return false
  return s
}
