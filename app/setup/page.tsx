'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderOpen, GitBranch, Github, DollarSign,
  Key, Palette, ArrowRight, ArrowLeft, Check, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCENT_PRESETS = [
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
];

interface SetupData {
  openclawDataDir: string;
  projectRepoPath: string;
  githubRepo: string;
  dailySpendLimit: number;
  keyRotationDays: number;
  accentColor: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<SetupData>({
    openclawDataDir: '~/.openclaw',
    projectRepoPath: '~/my-project',
    githubRepo: '',
    dailySpendLimit: 15,
    keyRotationDays: 30,
    accentColor: '#3b82f6',
  });

  const update = (field: keyof SetupData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const steps = [
    {
      title: 'OpenClaw Data',
      icon: <FolderOpen className="w-5 h-5" />,
      description: 'Where does OpenClaw store its operational data?',
      content: (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-text-secondary mb-1 block">Data directory path</span>
            <input
              type="text"
              value={data.openclawDataDir}
              onChange={(e) => update('openclawDataDir', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="~/.openclaw"
            />
          </label>
          <p className="text-xs text-text-muted">
            This directory contains gateway logs, agent sessions, and config files.
          </p>
        </div>
      ),
    },
    {
      title: 'Project Repo',
      icon: <GitBranch className="w-5 h-5" />,
      description: 'Where is the project repository?',
      content: (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-text-secondary mb-1 block">Local repo path</span>
            <input
              type="text"
              value={data.projectRepoPath}
              onChange={(e) => update('projectRepoPath', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="~/my-project"
            />
          </label>
          <p className="text-xs text-text-muted">
            Must be a valid git repository. Sprint and task files will be parsed from here.
          </p>
        </div>
      ),
    },
    {
      title: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      description: 'Optional: Connect to a GitHub repository for issue sync.',
      content: (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-text-secondary mb-1 block">GitHub repo (owner/repo)</span>
            <input
              type="text"
              value={data.githubRepo}
              onChange={(e) => update('githubRepo', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="your-org/your-repo"
            />
          </label>
          <p className="text-xs text-text-muted">
            Leave empty to skip. If you need private repo access, add a GITHUB_PAT to .env.local.
          </p>
        </div>
      ),
    },
    {
      title: 'Cost Alerts',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Set your daily spend threshold for alerts.',
      content: (
        <div className="space-y-6">
          <label className="block">
            <span className="text-sm text-text-secondary mb-1 block">Daily spend limit (USD)</span>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">$</span>
              <input
                type="number"
                value={data.dailySpendLimit}
                onChange={(e) => update('dailySpendLimit', parseFloat(e.target.value) || 0)}
                className="w-32 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                min={1}
                step={1}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-text-secondary mb-1 block">API key rotation reminder (days)</span>
            <input
              type="number"
              value={data.keyRotationDays}
              onChange={(e) => update('keyRotationDays', parseInt(e.target.value) || 30)}
              className="w-32 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              min={7}
              step={1}
            />
          </label>
        </div>
      ),
    },
    {
      title: 'Theme',
      icon: <Palette className="w-5 h-5" />,
      description: 'Choose your accent color.',
      content: (
        <div className="space-y-4">
          <div className="flex gap-3">
            {ACCENT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => update('accentColor', preset.value)}
                className={cn(
                  'w-12 h-12 rounded-xl border-2 transition-all',
                  data.accentColor === preset.value
                    ? 'border-white scale-110'
                    : 'border-transparent hover:border-border'
                )}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
          <p className="text-xs text-text-muted">
            Selected: {ACCENT_PRESETS.find(p => p.value === data.accentColor)?.name || 'Custom'}
          </p>
        </div>
      ),
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openclawDataDir: data.openclawDataDir,
          projectRepoPath: data.projectRepoPath,
          githubRepo: data.githubRepo || null,
          dailySpendLimit: data.dailySpendLimit,
          keyRotationDays: data.keyRotationDays,
          accentColor: data.accentColor,
          setupComplete: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to save configuration');
      router.push('/fleet');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            OpenClaw Dashboard
          </h1>
          <p className="text-text-secondary text-sm">
            Let&apos;s configure your dashboard
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === step ? 'bg-accent w-6' : i < step ? 'bg-accent/50' : 'bg-border'
              )}
            />
          ))}
        </div>

        {/* Step card */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="text-accent">{currentStep.icon}</div>
            <h2 className="text-lg font-semibold text-text-primary">{currentStep.title}</h2>
          </div>
          <p className="text-sm text-text-secondary mb-6">{currentStep.description}</p>

          {currentStep.content}

          {error && (
            <p className="text-sm text-status-red mt-4">{error}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
              step === 0
                ? 'text-text-muted cursor-not-allowed'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            )}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {isLast ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Complete Setup'}
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
