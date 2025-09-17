import { Component } from '@angular/core';
import { JobService } from '../services/job.service';
import { JobPosts } from '../models/jobModel';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment.prod';

@Component({
  selector: 'app-job-post',
  imports: [NgIf, FormsModule],
  templateUrl: './job-post.html',
  styleUrl: './job-post.scss'
})
export class JobPost {
  job: JobPosts = {
    title: '',
    description: '',
    location: '',
    employmentType: '',
    technologyStack: '',
    clientName: '',
    contactEmail: '',
    postedAt: ''
  };
  submitting = false;
  message = '';
  // Auto-edit resume fields
  resumeText: string = '';
  resumeFileName: string = '';
  editedResumeText: string = '';

  constructor(private jobService: JobService, private http: HttpClient) {}

  // Resume file selected -> read as text
  async onResumeFileSelected(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.resumeFileName = file.name;
    try {
      const text = await file.text();
      this.resumeText = text;
    } catch (e) {
      console.error('Failed to read resume file', e);
      this.message = 'Failed to read resume file. Please paste the text instead.';
    }
  }

  // Auto-edit the resume by inserting short experience/skill lines for missing skills
  autoEditResume(): void {
    const jdText = `${this.job.title || ''} ${this.job.description || ''} ${this.job.technologyStack || ''}`.toLowerCase();
    if (!jdText.trim()) { this.message = 'Please provide job title/description/tech stack first.'; return; }

    const required = (this.job.technologyStack || '')
      .split(/[,;|]/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.toLowerCase());

    // also include top keywords from JD description
    const keywords = this.extractImportantKeywords(this.tokenize(jdText), 8).map(k => k.toLowerCase());
    const wanted = Array.from(new Set([...required, ...keywords]));

    const resume = (this.resumeText || '').trim();
    if (!resume) { this.message = 'Please paste or upload a resume to edit.'; return; }

    const resumeTokens = this.tokenize(resume.toLowerCase());
    const missing = wanted.filter(w => !resumeTokens.includes(w));

    // Build edit suggestions with better phrasing templates
    const additions: string[] = [];
    const templateFor = (skill: string) => {
      const s = skill.toLowerCase();
      if (s.includes('spring') || s.includes('spring boot')) return `Implemented backend services using Spring Boot, including REST APIs, dependency injection, and persistence (Spring Data).`;
      if (s === 'java') return `Developed server-side applications in Java with strong focus on clean OOP design and unit-tested components.`;
      if (s.includes('angular')) return `Built responsive front-end features using Angular, leveraging components, services, and RxJS for async data flows.`;
      if (s.includes('react')) return `Implemented interactive UIs using React, hooks, and state management; integrated REST APIs and client-side routing.`;
      if (s.includes('node') || s.includes('node.js')) return `Created backend services using Node.js, Express, and related tooling for scalable APIs and integrations.`;
      if (s.includes('aws')) return `Worked with AWS services (EC2, S3, Lambda) for cloud deployments and storage; familiar with CI/CD pipelines.`;
      if (s.includes('sql') || s.includes('mysql') || s.includes('postgres')) return `Designed and optimized SQL queries and schemas; experience with relational databases and ORM tools.`;
      if (s.includes('docker')) return `Containerized applications with Docker and managed multi-container setups for consistent deployments.`;
      // fallback: include the skill name naturally
      return `Experience with ${skill} including hands-on project work and practical use in production systems.`;
    };

    for (const m of missing) {
      const clean = m.replace(/[^a-z0-9\s\-_.]/gi, '').trim();
      if (!clean) continue;
      const phrase = templateFor(clean);
      // keep it concise: 1-2 sentences
      additions.push(phrase);
    }

    // If nothing missing, simply set edited to original with note
    if (additions.length === 0) {
      this.editedResumeText = `${resume}\n\n// Auto-edit: No missing skills detected; resume already aligns well with the job.`;
      this.message = 'No missing keywords/skills detected. Edited resume ready.';
      return;
    }

    // Insert additions near top: try to inject after first paragraph or as a new "Key Highlights" section
    const paragraphs = resume.split(/\n\s*\n/);
    let result = resume;
  const injection = `\nKey Highlights (auto-added):\n${additions.map(s => '- ' + s).join('\n')}\n`;
    if (paragraphs.length > 1) {
      paragraphs.splice(1, 0, injection);
      result = paragraphs.join('\n\n');
    } else {
      result = `${injection}\n${resume}`;
    }

    this.editedResumeText = result;
    this.message = `Auto-edit complete — ${additions.length} suggestion(s) added.`;
  }

  downloadEditedResume(filename = 'edited_resume.txt'): void {
    if (!this.editedResumeText) return;
    const blob = new Blob([this.editedResumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  submitJob(): void {
    if (!this.job.title || !this.job.contactEmail) {
      this.message = 'Title and contact email are required.';
      return;
    }
    this.submitting = true;
    this.jobService.postJob(this.job).subscribe({
      next: () => {
        this.message = 'Job posted successfully!';
        this.submitting = false;
        const postedJob = Object.assign({}, this.job);
        this.job = { title: '', description: '', location: '', employmentType: '', technologyStack: '', clientName: '', contactEmail: '', postedAt: '' };
        this.analyzeAndShortlist(postedJob).catch(err => {
          console.warn('Shortlist analysis failed', err);
          const em = (err as any)?.message || JSON.stringify(err) || 'Unknown error';
          this.message = 'Job posted but shortlist analysis failed.';
          Swal.fire('Shortlist analysis failed', `<pre style="text-align:left;white-space:pre-wrap">${em}</pre>`, 'error');
        });
      },
      error: err => {
        this.message = 'Failed to post job.';
        this.submitting = false;
      }
    });
  }

  // Fetch resumes, extract keywords, and show per-candidate matched/missing keywords
  private async analyzeAndShortlist(job: JobPosts): Promise<void> {
    try {
      const api = `${environment.apiBaseUrl}/resumes`;
      const res: any = await this.http.get(api, { withCredentials: true }).toPromise();
      const resumes: any[] = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);

      const jobText = `${job.title} ${job.description} ${job.technologyStack || ''}`.toLowerCase();
      const jobKeywords = this.extractImportantKeywords(this.tokenize(jobText), 12);
      const requiredSkills = (job.technologyStack || '').split(/[,;|]/).map(s => s.trim().toLowerCase()).filter(Boolean);

      const scored = resumes.map((r: any) => {
        const resumeText = `${r.name || ''} ${r.summary || ''} ${(r.tags || []).join(' ')} ${r.title || ''} ${(r.technologyStack || '')}`.toLowerCase();
        const resumeTokens = this.tokenize(resumeText);
        const matched = jobKeywords.filter(k => resumeTokens.includes(k));
        const missingKeywords = jobKeywords.filter(k => !resumeTokens.includes(k));
        const matchedSkills = requiredSkills.filter((s: string) => (r.tags || []).map((t: string) => t.toLowerCase()).includes(s) || (r.technologyStack || '').toLowerCase().includes(s));
        const missingSkills = requiredSkills.filter((s: string) => !matchedSkills.includes(s));
        const score = (new Set(matched)).size + matchedSkills.length * 2;
        return { resume: r, score, matched: Array.from(new Set(matched)).slice(0, 12), missingKeywords, matchedSkills, missingSkills };
      });

      scored.sort((a: any, b: any) => b.score - a.score);

      const perfect = scored.filter((s: any) => {
        if (requiredSkills && requiredSkills.length > 0) {
          return Array.isArray(s.missingSkills) && s.missingSkills.length === 0;
        }
        if (jobKeywords && jobKeywords.length > 0) {
          return (s.matched || []).length >= new Set(jobKeywords).size;
        }
        return false;
      });

      if (!perfect || perfect.length === 0) {
        await Swal.fire('No perfect matches', 'No candidates matched all required skills.', 'info');
        return;
      }

      const top = perfect.slice(0, 7);
      const jobKeywordsDisplay = jobKeywords.slice(0, 30).join(', ') || '\u2014';
      const html = top.map((s: any) => {
        const r = s.resume;
        const missingParts: string[] = [];
        if (s.missingSkills && s.missingSkills.length) missingParts.push(`Skills: ${s.missingSkills.join(', ')}`);
        if (s.missingKeywords && s.missingKeywords.length) missingParts.push(`Keywords: ${s.missingKeywords.join(', ')}`);
        const miss = missingParts.length ? `<div style="color:#d9534f;font-weight:600">Missing: ${missingParts.join(' • ')}</div>` : '<div style="color:#28a745">No major skills missing</div>';
        const downloadBtn = r.id ? `<a href="${environment.apiBaseUrl}/resumes/${r.id}/download" target="_blank" class="swal-download" style="display:inline-block;margin-top:6px">Download</a>` : '';
        return `
          <div style="padding:10px;border-bottom:1px solid #eef2f6">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:700">${r.name || 'N/A'} <span style="color:#6b7280;font-weight:500">(${r.title || '—'})</span></div>
                <div style="font-size:0.9rem;color:#6b7280">Score: ${s.score} • Matched: ${s.matched.join(', ') || '—'}</div>
              </div>
              <div style="text-align:right">${downloadBtn}</div>
            </div>
            <div style="margin-top:8px">${miss}</div>
          </div>
        `;
      }).join('');

      await Swal.fire({
        title: 'Shortlisted Candidates',
        html: `<div style="text-align:left"><div style="margin-bottom:8px;color:#374151"><strong>Extracted keywords:</strong> ${jobKeywordsDisplay}</div><div style="max-height:420px;overflow:auto">${html}</div></div>`,
        width: 900,
        confirmButtonText: 'Ok'
      });
    } catch (err) {
      console.error('Error during shortlist analysis', err);
      const em = (err as any)?.message || (err && JSON.stringify(err)) || 'Unknown error';
      const choice = await Swal.fire({
        title: 'Failed to load resumes',
        html: `Could not fetch resumes from server:<pre style="text-align:left;white-space:pre-wrap">${em}</pre><p>You can continue analysis using a small sample dataset (no server required).</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Use sample resumes',
        cancelButtonText: 'Cancel'
      });

      if (choice.isConfirmed) {
        const sampleResumes = [
          { id: 's1', name: 'Alice Johnson', title: 'Frontend Developer', summary: '5 years React and Angular experience', tags: ['react','angular','typescript'], technologyStack: 'React, Angular, TypeScript' },
          { id: 's2', name: 'Bob Lee', title: 'Backend Engineer', summary: 'Node.js and Java expertise', tags: ['node','java','sql'], technologyStack: 'Node.js, Java' },
          { id: 's3', name: 'Carol Smith', title: 'Fullstack', summary: 'Fullstack with Python and React', tags: ['python','react','django'], technologyStack: 'Python, React' }
        ];

        const jobText = `${job.title} ${job.description} ${job.technologyStack || ''}`.toLowerCase();
        const jobKeywords = this.extractImportantKeywords(this.tokenize(jobText), 12);
        const requiredSkills = (job.technologyStack || '').split(/[,;|]/).map(s => s.trim().toLowerCase()).filter(Boolean);

        const scored = sampleResumes.map((r: any) => {
          const resumeText = `${r.name || ''} ${r.summary || ''} ${(r.tags||[]).join(' ')} ${r.title || ''} ${(r.technologyStack || '')}`.toLowerCase();
          const resumeTokens = this.tokenize(resumeText);
          const matched = jobKeywords.filter(k => resumeTokens.includes(k));
          const missingKeywords = jobKeywords.filter(k => !resumeTokens.includes(k));
          const matchedSkills = requiredSkills.filter((s: string) => (r.tags || []).map((t: string) => t.toLowerCase()).includes(s) || (r.technologyStack || '').toLowerCase().includes(s));
          const missingSkills = requiredSkills.filter((s: string) => !matchedSkills.includes(s));
          const score = (new Set(matched)).size + matchedSkills.length * 2;
          return { resume: r, score, matched: Array.from(new Set(matched)).slice(0,12), missingKeywords, matchedSkills, missingSkills };
        });

        scored.sort((a: any,b: any) => b.score - a.score);

        const perfectSample = scored.filter((s: any) => {
          if (requiredSkills && requiredSkills.length > 0) {
            return Array.isArray(s.missingSkills) && s.missingSkills.length === 0;
          }
          if (jobKeywords && jobKeywords.length > 0) {
            return (s.matched || []).length >= new Set(jobKeywords).size;
          }
          return false;
        });

        if (!perfectSample || perfectSample.length === 0) {
          await Swal.fire('No perfect matches (sample)', 'No sample candidates matched all required skills.', 'info');
          return;
        }

        const top = perfectSample.slice(0,7);
        const jobKeywordsDisplay = jobKeywords.slice(0, 30).join(', ') || '\u2014';
        const html = top.map((s: any) => {
          const r = s.resume;
          const missingParts: string[] = [];
          if (s.missingSkills && s.missingSkills.length) missingParts.push(`Skills: ${s.missingSkills.join(', ')}`);
          if (s.missingKeywords && s.missingKeywords.length) missingParts.push(`Keywords: ${s.missingKeywords.join(', ')}`);
          const miss = missingParts.length ? `<div style="color:#d9534f;font-weight:600">Missing: ${missingParts.join(' • ')}</div>` : '<div style="color:#28a745">No major skills missing</div>';
          const downloadBtn = r.id ? `<a href="${environment.apiBaseUrl}/resumes/${r.id}/download" target="_blank" class="swal-download" style="display:inline-block;margin-top:6px">Download</a>` : '';
          return `
            <div style="padding:10px;border-bottom:1px solid #eef2f6">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:700">${r.name || 'N/A'} <span style="color:#6b7280;font-weight:500">(${r.title||'—'})</span></div>
                  <div style="font-size:0.9rem;color:#6b7280">Score: ${s.score} • Matched: ${s.matched.join(', ') || '—'}</div>
                </div>
                <div style="text-align:right">${downloadBtn}</div>
              </div>
              <div style="margin-top:8px">${miss}</div>
            </div>
          `;
        }).join('');

        await Swal.fire({
          title: 'Shortlisted Candidates (sample data)',
          html: `<div style="text-align:left"><div style="margin-bottom:8px;color:#374151"><strong>Extracted keywords:</strong> ${jobKeywordsDisplay}</div><div style="max-height:420px;overflow:auto">${html}</div></div>`,
          width: 900,
          confirmButtonText: 'Ok'
        });
        return;
      }

      Swal.fire('Shortlist analysis error', 'Analysis aborted because resumes could not be loaded.', 'error');
      throw err;
    }
  }

  private tokenize(text: string): string[] {
    return (text || '').split(/[^a-z0-9]+/i).map(t => t.trim()).filter(Boolean).filter(w => w.length>1);
  }

  // Extract important keywords helper
  private extractImportantKeywords(tokens: string[], topK = 10): string[] {
    if (!tokens || tokens.length === 0) return [];
    const stopwords = new Set(['the','and','for','with','that','this','from','your','will','have','has','not','but','are','you','our','any','able','using','use','within','including','based','years','year','experience','experiences','a','an','of','in','on','to','is','as']);
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
}
