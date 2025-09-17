import { Component, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment.prod';
import { NgIf, CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jd-analyzer',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, HttpClientModule],
  templateUrl: './jd-analyzer.html',
  styleUrls: ['./jd-analyzer.scss']
})
export class JdAnalyzer {
  jdText = '';
  submitting = false;
  message = '';
  selectedFileName = '';
  resultMatches: any[] = [];
  // keyword match threshold between 0 and 1 (default 0.4 meaning 40%)
  keywordThreshold = 0.4;

  get thresholdPercent(): number {
    return Math.round((this.keywordThreshold || 0) * 100);
  }

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient) {}

  openDownload(id: any): void {
    if (!id) return;
    const url = `${environment.apiBaseUrl}/resumes/${id}/download`;
    try { window.open(url, '_blank'); } catch (e) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.click(); }
  }

  triggerFilePicker(): void {
    try { this.fileInputRef?.nativeElement?.click(); } catch (e) {
      const el = document.getElementById('jd-file-input') as HTMLInputElement | null;
      if (el) el.click();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedFileName = file.name;

    // If it's a text file, read locally and analyze client-side
    if (file.type.startsWith('text') || file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = () => { this.jdText = (reader.result || '').toString(); };
      reader.readAsText(file);
      console.log(reader.readAsText(file));
      return;
    }

    // For binary files (pdf/docx), attempt server-side analysis endpoint
    this.submitting = true;
    this.message = 'Uploading JD for server-side analysis...';

    const fd = new FormData();
    fd.append('file', file);

    const url = `${environment.apiBaseUrl}/analyze-jd`;

    this.http.post(url, fd, { reportProgress: true, observe: 'events', withCredentials: true }).subscribe({
      next: ev => {
        if (ev.type === HttpEventType.UploadProgress && ev.total) {
          const pct = Math.round(100 * (ev.loaded / ev.total));
          this.message = `Uploading JD... ${pct}%`;
        } else if ((ev as any).type === HttpEventType.Response) {
          this.submitting = false;
          const body: any = (ev as any).body;
          if (body && Array.isArray(body.matches)) {
            this.resultMatches = body.matches;
            this.message = `Found ${this.resultMatches.length} matches from server.`;
            this.showMatchesModal(this.resultMatches, body.jobKeywords || []);
          } else if (body && body.error) {
            this.message = 'Server analysis returned an error. Falling back to client analysis.';
            if (body.extractedText) { this.jdText = body.extractedText; this.analyzeFromText(); }
          } else {
            this.message = 'No matches returned from server. Falling back to client analysis.';
          }
        }
      },
      error: err => {
  this.submitting = false;
  console.warn('Server analyze-jd failed', err);
  const errMsg = err?.error?.message || err?.message || JSON.stringify(err);
  this.message = 'Server analysis failed. You can paste JD text to analyze locally.';
  Swal.fire('Server analysis failed', `<pre style="text-align:left;white-space:pre-wrap">${errMsg}</pre>`, 'error');
      }
    });
  }

  analyzeFromText(): void {
    const t = (this.jdText || '').trim();
    if (!t) { this.message = 'Please provide job description text to analyze.'; return; }
    this.submitting = true;
    this.message = 'Analyzing resumes locally...';

    this.analyzeAndShortlist({ title: 'Ad-hoc JD', description: t, technologyStack: '' } as any).then(matches => {
      this.submitting = false;
      this.resultMatches = matches || [];
      this.message = `Found ${this.resultMatches.length} matches locally.`;
      this.showMatchesModal(this.resultMatches, []);
    }).catch(err => {
  this.submitting = false;
  this.message = 'Analysis failed. See console for details.';
  console.error('Local analysis failed', err);
  Swal.fire('Local analysis failed', err?.message || String(err), 'error');
    });
  }

  private async analyzeAndShortlist(job: any): Promise<any[]> {
    try {
      const api = `${environment.apiBaseUrl}/resumes`;
  const res: any = await this.http.get(api, { withCredentials: true }).toPromise();
  const resumes: any[] = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);

  // First, attempt to extract/get full text for each resume.
  const resumesWithText = await Promise.all(resumes.map(async (r: any) => {
    const extracted = await this.fetchResumeText(r).catch(e => null);
    return Object.assign({}, r, { _extractedText: (extracted || `${r.name || ''} ${r.summary || ''} ${(r.tags||[]).join(' ')} ${r.title || ''} ${r.technologyStack || ''}`).toString() });
  }));

  // Log full extracted text and tags (comma-separated) for debugging/inspection
  try {
    console.groupCollapsed && console.groupCollapsed('Resumes extracted content');
    resumesWithText.forEach((r: any, idx: number) => {
      const txt = (r._extractedText || '').toString();
      const tags = Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || '');
      console.log(`resume[${idx}] id=${r.id} name=${r.name || 'N/A'}`);
      console.log('--- extracted text ---');
      console.log(txt);
      console.log('--- tags ---');
      console.log(tags);
      console.log('----------------------');
    });
    console.groupEnd && console.groupEnd();
  } catch (e) {
    console.log('Could not log resumesWithText', e);
  }

  const jobText = `${job.title} ${job.description} ${job.technologyStack || ''}`.toLowerCase();
  // extract important keywords (top tokens excluding stopwords)
  const jobTokens = this.tokenize(jobText);
  const jobKeywords = this.extractImportantKeywords(jobTokens, 12);
  const requiredSkills = (job.technologyStack || '').split(/[,;|]/).map((s: string) => s.trim().toLowerCase()).filter(Boolean);

      const scored = await Promise.all(resumesWithText.map(async (r: any) => {
        const resumeText = (r._extractedText || `${r.name || ''} ${r.summary || ''} ${(r.tags||[]).join(' ')} ${r.title || ''}`).toLowerCase();
        const resumeTokens = this.tokenize(resumeText);
        const matched = jobKeywords.filter(k => resumeTokens.includes(k));
        const missingKeywords = jobKeywords.filter(k => !resumeTokens.includes(k));
        const matchedSkills = requiredSkills.filter((s: string) => (r.tags || []).map((t: string) => t.toLowerCase()).includes(s) || (r.technologyStack || '').toLowerCase().includes(s));
        const missingSkills = requiredSkills.filter((s: string) => !matchedSkills.includes(s));
        // score: keyword matches + 2*matchedSkills
        const score = (new Set(matched)).size + matchedSkills.length * 2;
        return {
          resume: r,
          score,
          matched: Array.from(new Set(matched)).slice(0, 12),
          missingKeywords,
          matchedSkills,
          missingSkills
        };
      }));

      scored.sort((a: any,b: any) => b.score - a.score);

  // Matching policy: prefer candidates with all required skills, otherwise allow partial keyword matches.
  // Use the user-controlled threshold (keywordThreshold) to include near-matches.
  const KEYWORD_MATCH_THRESHOLD = Math.max(0, Math.min(1, this.keywordThreshold || 0.4));

  console.debug('Job keywords:', jobKeywords, 'threshold:', KEYWORD_MATCH_THRESHOLD);

      const perfect = scored.filter((s: any) => {
        // if the job explicitly lists required skills, require those
        if (requiredSkills && requiredSkills.length > 0) {
          const ok = Array.isArray(s.missingSkills) && s.missingSkills.length === 0;
          console.debug('candidate', s.resume?.id, 'matchedSkills:', s.matchedSkills, 'missingSkills:', s.missingSkills, 'skill-ok:', ok);
          return ok;
        }

        // otherwise use keyword coverage threshold
        if (jobKeywords && jobKeywords.length > 0) {
          const total = new Set(jobKeywords).size || 0;
          const matchedCount = new Set(s.matched || []).size;
          const ratio = total > 0 ? (matchedCount / total) : 0;
          console.debug('candidate', s.resume?.id, 'matchedKeywords:', matchedCount, 'totalKeywords:', total, 'ratio:', ratio);
          return ratio >= KEYWORD_MATCH_THRESHOLD;
        }

        return false;
      });

      if (!perfect || perfect.length === 0) return [];

      const top = perfect.slice(0, 7);
      return top.map((s: any) => ({
        id: s.resume.id,
        name: s.resume.name,
        title: s.resume.title,
        score: s.score,
        matched: s.matched,
        missingKeywords: s.missingKeywords || [],
        matchedSkills: s.matchedSkills,
        missingSkills: s.missingSkills
      }));
    } catch (err) {
      console.error('Error during shortlist analysis', err);
      const em = (err as any)?.message || (err && JSON.stringify(err)) || 'Unknown error';
      // Offer to run analysis on a small built-in sample dataset so user can continue
      const choice = await Swal.fire({
        title: 'Failed to load resumes',
        html: `Could not fetch resumes from server:<pre style="text-align:left;white-space:pre-wrap">${em}</pre><p>You can continue analysis using a small sample dataset (no server required).</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Use sample resumes',
        cancelButtonText: 'Cancel'
      });

      if (choice.isConfirmed) {
        // small built-in sample resumes
        const sampleResumes = [
          { id: 's1', name: 'Alice Johnson', title: 'Frontend Developer', summary: '5 years React and Angular experience', tags: ['react','angular','typescript'], technologyStack: 'React, Angular, TypeScript' },
          { id: 's2', name: 'Bob Lee', title: 'Backend Engineer', summary: 'Node.js and Java expertise', tags: ['node','java','sql'], technologyStack: 'Node.js, Java' },
          { id: 's3', name: 'Carol Smith', title: 'Fullstack', summary: 'Fullstack with Python and React', tags: ['python','react','django'], technologyStack: 'Python, React' }
        ];

  // reuse scoring logic with sampleResumes
  const jobText = `${job.title} ${job.description} ${job.technologyStack || ''}`.toLowerCase();
  const jobKeywords = this.extractImportantKeywords(this.tokenize(jobText), 12);
        const requiredSkills = (job.technologyStack || '').split(/[,;|]/).map((s: string) => s.trim().toLowerCase()).filter(Boolean);

        const scored = sampleResumes.map((r: any) => {
          const resumeText = `${r.name || ''} ${r.summary || ''} ${(r.tags||[]).join(' ')} ${r.title || ''}`.toLowerCase();
          const resumeTokens = this.tokenize(resumeText);
          const matched = jobKeywords.filter(k => resumeTokens.includes(k));
          const missingKeywords = jobKeywords.filter(k => !resumeTokens.includes(k));
          const matchedSkills = requiredSkills.filter((s: string) => (r.tags || []).map((t: string) => t.toLowerCase()).includes(s) || (r.technologyStack || '').toLowerCase().includes(s));
          const missingSkills = requiredSkills.filter((s: string) => !matchedSkills.includes(s));
          const score = (new Set(matched)).size + matchedSkills.length * 2;
          return { resume: r, score, matched: Array.from(new Set(matched)).slice(0,12), missingKeywords, matchedSkills, missingSkills };
        });

        scored.sort((a: any,b: any) => b.score - a.score);
        const top = scored.slice(0,7);
        return top.map((s: any) => ({ id: s.resume.id, name: s.resume.name, title: s.resume.title, score: s.score, matched: s.matched, matchedSkills: s.matchedSkills, missingSkills: s.missingSkills }));
      }

      Swal.fire('Shortlist analysis error', 'Analysis aborted because resumes could not be loaded.', 'error');
      throw err;
    }
  }

  private showMatchesModal(matches: any[], jobKeywords: string[] = []): void {
    const jobKeywordsDisplay = (jobKeywords || []).slice(0, 30).join(', ') || '\u2014';
    const html = matches.map((s: any) => {
      const downloadBtn = s.id ? `<a href="${environment.apiBaseUrl}/resumes/${s.id}/download" target="_blank" class="swal-download" style="display:inline-block;margin-top:6px">Download</a>` : '';
      const miss = s.missingSkills && s.missingSkills.length ? `<div style="color:#d9534f;font-weight:600">Missing: ${s.missingSkills.join(', ')}</div>` : '<div style="color:#28a745">No major skills missing</div>';
      // include a collapsed block showing the plain extracted resume text used for matching
      const plainText = (s._extractedText || s.plainText || '').toString();
      const txtBlock = plainText ? `<details style="margin-top:8px"><summary style="cursor:pointer;color:#2563eb">View plain text</summary><pre style="white-space:pre-wrap;max-height:260px;overflow:auto;padding:8px;background:#f8fafc;border-radius:4px;margin-top:6px">${this.escapeHtml(plainText)}</pre></details>` : '';
      return `
        <div style="padding:10px;border-bottom:1px solid #eef2f6">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700">${s.name || 'N/A'} <span style="color:#6b7280;font-weight:500">(${s.title||'—'})</span></div>
              <div style="font-size:0.9rem;color:#6b7280">Score: ${s.score} • Matched: ${s.matched.join(', ') || '—'}</div>
            </div>
            <div style="text-align:right">${downloadBtn}</div>
          </div>
          <div style="margin-top:8px">${miss}</div>
          ${txtBlock}
        </div>
      `;
    }).join('');

    Swal.fire({
      title: 'Shortlisted Candidates',
      html: `<div style="text-align:left"><div style="margin-bottom:8px;color:#374151"><strong>Extracted keywords:</strong> ${jobKeywordsDisplay}</div><div style="max-height:420px;overflow:auto">${html}</div></div>`,
      width: 900,
      confirmButtonText: 'Ok'
    });
  }

  private tokenize(text: string): string[] {
    return text.split(/[^a-z0-9]+/i).map(t => t.trim()).filter(Boolean).filter((w: string) => w.length>1);
  }

  // Attempt to extract full text from a resume record.
  // Strategy: use provided fields, else try a text endpoint `/resumes/{id}/text`, else try download and treat as fallback.
  private async fetchResumeText(resume: any): Promise<string|null> {
    if (!resume) return null;
    // If resume already contains fullText or parsedText fields, prefer them
    if (resume.fullText && typeof resume.fullText === 'string' && resume.fullText.trim()) return resume.fullText;
    if (resume.parsedText && typeof resume.parsedText === 'string' && resume.parsedText.trim()) return resume.parsedText;

    // Build a simple assembled text from metadata as baseline
    const baseline = `${resume.name || ''} ${resume.summary || ''} ${(resume.tags||[]).join(' ')} ${resume.title || ''} ${resume.technologyStack || ''}`.trim();
    // If server provides a text extraction endpoint, try it: /resumes/{id}/text
    if (resume.id) {
      try {
        const textUrl = `${environment.apiBaseUrl}/resumes/${resume.id}/text`;
        const res: any = await this.http.get(textUrl, { responseType: 'text' as 'json', withCredentials: true }).toPromise();
        if (res && typeof res === 'string' && res.trim()) return res;
      } catch (e) {
        // ignore and try download fallback
        console.debug('resume text endpoint failed for', resume.id, e);
      }

      // Try to fetch the download URL and read text if available (may not work for binary PDFs)
      try {
        const dlUrl = `${environment.apiBaseUrl}/resumes/${resume.id}/download`;
        const res2: any = await this.http.get(dlUrl, { responseType: 'text' as 'json', withCredentials: true }).toPromise();
        if (res2 && typeof res2 === 'string' && res2.trim()) return res2;
      } catch (e) {
        console.debug('resume download as text failed for', resume.id, e);
      }
    }

    // Fallback to baseline metadata
    return baseline || null;
  }

  // Extract important keywords from tokens using frequency and simple heuristics.
  private extractImportantKeywords(tokens: string[], topK = 10): string[] {
    if (!tokens || tokens.length === 0) return [];
    const stopwords = new Set([
      'the','and','for','with','that','this','from','your','will','have','has','not','but','are','you','our','any','able','using','use','within','including','based','years','year','experience','experiences','a','an','of','in','on','to','is','as'
    ]);
    const freq: Record<string, number> = {};
    for (const t of tokens) {
      if (!t) continue;
      const w = t.toLowerCase();
      if (stopwords.has(w)) continue;
      if (w.length <= 2) continue;
      freq[w] = (freq[w] || 0) + 1;
    }
    const pairs = Object.keys(freq).map(k => ({ k, v: freq[k] }));
    pairs.sort((a, b) => b.v - a.v);
    return pairs.slice(0, topK).map(p => p.k);
  }

  // Simple HTML escape for safe insertion into modal
  private escapeHtml(s: string): string {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
