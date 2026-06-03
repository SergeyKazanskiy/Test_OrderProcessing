'use client';

// ─── Подсветка синтаксиса JSON для response-панели ───────────────────────────

function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m)) return /:$/.test(m)
          ? `<span class="json-key">${m}</span>`
          : `<span class="json-str">${m}</span>`;
        if (/true|false/.test(m)) return `<span class="json-bool">${m}</span>`;
        if (/null/.test(m))       return `<span class="json-null">${m}</span>`;
        return `<span class="json-num">${m}</span>`;
      }
    );
}

export function JsonViewer({ data }: { data: unknown }) {
  return (
    <pre
      className="font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: highlight(JSON.stringify(data, null, 2)) }}
    />
  );
}
