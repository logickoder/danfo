// CSV plumbing: RFC 4180 quoting and file assembly. Format only; app writers decide columns.

export function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function csvLine(fields: readonly string[]): string {
  return fields.map(csvField).join(',')
}

export function csvFile(header: readonly string[], rows: readonly (readonly string[])[]): string {
  return [csvLine(header), ...rows.map(csvLine)].join('\n') + '\n'
}
