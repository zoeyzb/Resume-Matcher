'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  fetchLlmConfig,
  updateLlmConfig,
  testLlmConnection,
  fetchFeatureConfig,
  updateFeatureConfig,
  fetchPromptConfig,
  updatePromptConfig,
  clearAllApiKeys,
  resetDatabase,
  PROVIDER_INFO,
  fetchFeaturePrompts,
  updateFeaturePrompts,
  FeaturePromptsError,
  fetchApiKeyStatus,
  updateApiKeys,
  deleteApiKey,
  llmProviderToKeyProvider,
  API_KEY_PROVIDER_INFO,
  type LLMConfigUpdate,
  type LLMProvider,
  type LLMHealthCheck,
  type PromptOption,
  type ReasoningEffort,
  type FeaturePromptsUpdate,
  type ApiKeyProviderStatus,
  type ApiKeyProvider,
} from '@/lib/api/config';
import { API_URL } from '@/lib/api/client';
import { getVersionString } from '@/lib/config/version';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useStatusCache } from '@/lib/context/status-cache';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dropdown } from '@/components/ui/dropdown';
import { Alert } from '@/components/ui/alert';
import { Disclosure } from '@/components/ui/disclosure';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import {
  Save,
  Key,
  Database,
  Activity,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  FileText,
  Briefcase,
  Sparkles,
  Clock,
  Globe,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '@/lib/context/language-context';
import { useTranslations } from '@/lib/i18n';
import type { SupportedLanguage } from '@/lib/api/config';
import type { Locale } from '@/i18n/config';

type Status = 'idle' | 'loading' | 'saving' | 'saved' | 'error' | 'testing';

const PROVIDERS: LLMProvider[] = [
  'openai',
  'openai_compatible',
  'anthropic',
  'openrouter',
  'gemini',
  'deepseek',
  'groq',
  'ollama',
];

const SEGMENT_BASE =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50';
const SEGMENT_ACTIVE = 'bg-primary text-white';
const SEGMENT_INACTIVE = 'bg-white border border-border text-ink-soft hover:bg-paper-tint';

const unwrapCodeBlock = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const fenced = trimmed.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```\s*$/);
  if (fenced) {
    return fenced[1]?.trimEnd() || null;
  }
  return trimmed;
};

const getHealthCheckMessage = (
  t: (key: string, params?: Record<string, string | number>) => string,
  baseKey: string,
  code?: string,
  fallback?: string
): string | null => {
  if (code) {
    const key = `${baseKey}.${code}`;
    const localized = t(key);
    return localized !== key ? localized : (fallback ?? code);
  }
  return fallback ?? null;
};

export default function SettingsPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  // LLM Config state
  const [provider, setProvider] = useState<LLMProvider>('openai');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [hasStoredApiKey, setHasStoredApiKey] = useState(false);
  const [apiKeyStatuses, setApiKeyStatuses] = useState<ApiKeyProviderStatus[]>([]);
  const [reasoningEffort, setReasoningEffort] = useState<ReasoningEffort | 'auto'>('auto');

  const {
    status: systemStatus,
    isLoading: statusLoading,
    lastFetched,
    refreshStatus,
  } = useStatusCache();

  const [healthCheck, setHealthCheck] = useState<LLMHealthCheck | null>(null);

  const [enableCoverLetter, setEnableCoverLetter] = useState(false);
  const [enableOutreach, setEnableOutreach] = useState(false);
  const [enableInterviewPrep, setEnableInterviewPrep] = useState(false);
  const [featureConfigLoading, setFeatureConfigLoading] = useState(false);
  const [promptConfigLoading, setPromptConfigLoading] = useState(false);
  const [promptOptions, setPromptOptions] = useState<PromptOption[]>([]);
  const [defaultPromptId, setDefaultPromptId] = useState('keywords');

  const [coverLetterPrompt, setCoverLetterPrompt] = useState('');
  const [outreachPrompt, setOutreachPrompt] = useState('');
  const [coverLetterDefault, setCoverLetterDefault] = useState('');
  const [outreachDefault, setOutreachDefault] = useState('');
  const [featurePromptSaving, setFeaturePromptSaving] = useState<string | null>(null);
  const [featurePromptError, setFeaturePromptError] = useState<{
    field: string;
    missing: string[];
  } | null>(null);

  const [keyToDelete, setKeyToDelete] = useState<ApiKeyProvider | null>(null);

  const [showClearApiKeysDialog, setShowClearApiKeysDialog] = useState(false);
  const [showResetDatabaseDialog, setShowResetDatabaseDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessDialogMessage] = useState({ title: '', description: '' });
  const [isResetting, setIsResetting] = useState(false);

  const {
    contentLanguage,
    uiLanguage,
    setContentLanguage,
    setUiLanguage,
    languageNames,
    supportedLanguages,
    isLoading: languageLoading,
  } = useLanguage();

  const { t } = useTranslations();
  const providerInfo = PROVIDER_INFO[provider] ?? PROVIDER_INFO['openai'];
  const fallbackPromptOptions = useMemo<PromptOption[]>(
    () => [
      {
        id: 'nudge',
        label: t('tailor.promptOptions.nudge.label'),
        description: t('tailor.promptOptions.nudge.description'),
      },
      {
        id: 'keywords',
        label: t('tailor.promptOptions.keywords.label'),
        description: t('tailor.promptOptions.keywords.description'),
      },
      {
        id: 'full',
        label: t('tailor.promptOptions.full.label'),
        description: t('tailor.promptOptions.full.description'),
      },
    ],
    [t]
  );
  const promptOptionOverrides = useMemo<Record<string, { label: string; description: string }>>(
    () => ({
      nudge: {
        label: t('tailor.promptOptions.nudge.label'),
        description: t('tailor.promptOptions.nudge.description'),
      },
      keywords: {
        label: t('tailor.promptOptions.keywords.label'),
        description: t('tailor.promptOptions.keywords.description'),
      },
      full: {
        label: t('tailor.promptOptions.full.label'),
        description: t('tailor.promptOptions.full.description'),
      },
    }),
    [t]
  );
  const localizedPromptOptions = useMemo(() => {
    const options = promptOptions.length ? promptOptions : fallbackPromptOptions;
    return options.map((option) => {
      const override = promptOptionOverrides[option.id];
      return override ? { ...option, ...override } : option;
    });
  }, [promptOptions, fallbackPromptOptions, promptOptionOverrides]);
  const healthDetailItems = useMemo(() => {
    if (!healthCheck) return [];

    return [
      {
        key: 'testPrompt',
        label: t('settings.llmConfiguration.testPromptLabel'),
        value: unwrapCodeBlock(healthCheck.test_prompt),
      },
      {
        key: 'modelOutput',
        label: t('settings.llmConfiguration.modelOutputLabel'),
        value: unwrapCodeBlock(healthCheck.model_output),
      },
      {
        key: 'reasoningContent',
        label: t('settings.llmConfiguration.reasoningContentLabel'),
        value: unwrapCodeBlock(healthCheck.reasoning_content),
      },
      {
        key: 'errorDetail',
        label: t('settings.llmConfiguration.errorDetailLabel'),
        value: unwrapCodeBlock(healthCheck.error_detail),
      },
    ].filter((item) => item.value);
  }, [healthCheck, t]);
  const healthCheckError = useMemo(() => {
    if (!healthCheck) return null;
    return getHealthCheckMessage(
      t,
      'settings.llmConfiguration.healthErrors',
      healthCheck.error_code,
      healthCheck.error
    );
  }, [healthCheck, t]);
  const healthCheckWarning = useMemo(() => {
    if (!healthCheck) return null;
    return getHealthCheckMessage(
      t,
      'settings.llmConfiguration.healthWarnings',
      healthCheck.warning_code,
      healthCheck.warning
    );
  }, [healthCheck, t]);

  // Load LLM config and feature config on mount
  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const [llmConfig, featureConfig, promptConfig, featurePrompts, keyStatus] =
          await Promise.all([
            fetchLlmConfig().catch(() => null),
            fetchFeatureConfig().catch(() => null),
            fetchPromptConfig().catch(() => null),
            fetchFeaturePrompts().catch(() => null),
            fetchApiKeyStatus().catch(() => null),
          ]);

        if (cancelled) return;

        const statuses = keyStatus?.providers ?? [];
        setApiKeyStatuses(statuses);

        if (llmConfig) {
          const providerFromBackend = llmConfig.provider || 'openai';
          const safeProvider = PROVIDERS.includes(providerFromBackend as LLMProvider)
            ? (providerFromBackend as LLMProvider)
            : 'openai';
          setProvider(safeProvider);
          setModel(llmConfig.model || PROVIDER_INFO[safeProvider].defaultModel);
          const keyProvider = llmProviderToKeyProvider(safeProvider);
          setHasStoredApiKey(statuses.some((s) => s.provider === keyProvider && s.configured));
          setApiKey('');
          setApiBase(llmConfig.api_base || '');
          setReasoningEffort((llmConfig.reasoning_effort as ReasoningEffort | null) ?? 'auto');

          if (providerFromBackend !== safeProvider) {
            setError(t('settings.errors.unknownProvider', { provider: providerFromBackend }));
          }
        }

        if (featureConfig) {
          setEnableCoverLetter(featureConfig.enable_cover_letter);
          setEnableOutreach(featureConfig.enable_outreach_message);
          setEnableInterviewPrep(featureConfig.enable_interview_prep);
        }

        if (promptConfig) {
          setPromptOptions(promptConfig.prompt_options || []);
          setDefaultPromptId(promptConfig.default_prompt_id || 'keywords');
        }

        if (featurePrompts) {
          setCoverLetterPrompt(featurePrompts.cover_letter_prompt);
          setOutreachPrompt(featurePrompts.outreach_message_prompt);
          setCoverLetterDefault(featurePrompts.cover_letter_default);
          setOutreachDefault(featurePrompts.outreach_message_default);
        }

        setStatus('idle');
      } catch (err) {
        console.error('Failed to load settings', err);
        if (!cancelled) {
          setError(t('settings.errors.unableToConnectBackend'));
          setStatus('error');
        }
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const providerHasStoredKey = (p: LLMProvider): boolean => {
    const keyProvider = llmProviderToKeyProvider(p);
    return apiKeyStatuses.some((s) => s.provider === keyProvider && s.configured);
  };

  const refreshApiKeyStatus = async (): Promise<ApiKeyProviderStatus[]> => {
    const status = await fetchApiKeyStatus().catch(() => null);
    const statuses = status?.providers ?? [];
    setApiKeyStatuses(statuses);
    return statuses;
  };

  const handleDeleteApiKey = async (keyProvider: ApiKeyProvider) => {
    try {
      await deleteApiKey(keyProvider);
      const statuses = await refreshApiKeyStatus();
      if (llmProviderToKeyProvider(provider) === keyProvider) {
        setHasStoredApiKey(false);
      }
      void statuses;
    } catch (err) {
      console.error('Failed to delete API key', err);
      setError((err as Error).message || t('settings.errors.unableToSaveConfiguration'));
    } finally {
      setKeyToDelete(null);
    }
  };

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setModel(PROVIDER_INFO[newProvider].defaultModel);

    if (newProvider === 'ollama' && !apiBase.trim()) {
      setApiBase('http://localhost:11434');
    }
    if (newProvider === 'openai_compatible' && !apiBase.trim()) {
      setApiBase('http://localhost:8080/v1');
    }

    setApiKey('');
    setHasStoredApiKey(providerHasStoredKey(newProvider));
  };

  const handleSave = async () => {
    setStatus('saving');
    setError(null);
    setHealthCheck(null);

    try {
      if (requiresApiKey && !apiKey.trim() && !hasStoredApiKey) {
        setError(t('settings.errors.apiKeyRequired'));
        setStatus('error');
        return;
      }

      const trimmedKey = apiKey.trim();

      if (trimmedKey) {
        const keyProvider = llmProviderToKeyProvider(provider);
        await updateApiKeys({ [keyProvider]: trimmedKey } as Record<ApiKeyProvider, string>);
      }

      const update: LLMConfigUpdate = {
        provider,
        model: model.trim(),
        api_base: apiBase.trim() || null,
        reasoning_effort: reasoningEffort === 'auto' ? '' : (reasoningEffort as ReasoningEffort),
      };
      await updateLlmConfig(update);

      const statuses = await refreshApiKeyStatus();
      setApiKey('');
      setHasStoredApiKey(
        statuses.some((s) => s.provider === llmProviderToKeyProvider(provider) && s.configured)
      );
      await refreshStatus();

      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save config', err);
      setError((err as Error).message || t('settings.errors.unableToSaveConfiguration'));
      setStatus('error');
    }
  };

  const handleTestConnection = async () => {
    setStatus('testing');
    setError(null);
    setHealthCheck(null);

    try {
      const testConfig: LLMConfigUpdate = {
        provider,
        model: model.trim() || providerInfo.defaultModel,
        api_base: apiBase.trim() || null,
        reasoning_effort: reasoningEffort === 'auto' ? '' : (reasoningEffort as ReasoningEffort),
      };

      if (apiKey.trim()) {
        testConfig.api_key = apiKey.trim();
      }

      const result = await testLlmConnection(testConfig);
      setHealthCheck(result);
      setStatus('idle');
    } catch (err) {
      console.error('Failed to test connection', err);
      setHealthCheck({ healthy: false, provider, model, error: (err as Error).message });
      setStatus('idle');
    }
  };

  const handleFeatureConfigChange = async (
    key: 'enable_cover_letter' | 'enable_outreach_message' | 'enable_interview_prep',
    value: boolean
  ) => {
    setFeatureConfigLoading(true);
    try {
      const updated = await updateFeatureConfig({ [key]: value });
      setEnableCoverLetter(updated.enable_cover_letter);
      setEnableOutreach(updated.enable_outreach_message);
      setEnableInterviewPrep(updated.enable_interview_prep);
    } catch (err) {
      console.error('Failed to update feature config', err);
      if (key === 'enable_cover_letter') {
        setEnableCoverLetter(!value);
      } else if (key === 'enable_outreach_message') {
        setEnableOutreach(!value);
      } else {
        setEnableInterviewPrep(!value);
      }
    } finally {
      setFeatureConfigLoading(false);
    }
  };

  const handleFeaturePromptSave = async (
    field: 'cover_letter_prompt' | 'outreach_message_prompt',
    value: string
  ) => {
    setFeaturePromptSaving(field);
    setFeaturePromptError((prev) => (prev?.field === field ? null : prev));
    try {
      const update: FeaturePromptsUpdate = { [field]: value };
      const fresh = await updateFeaturePrompts(update);
      setCoverLetterPrompt(fresh.cover_letter_prompt);
      setOutreachPrompt(fresh.outreach_message_prompt);
    } catch (err) {
      if (err instanceof FeaturePromptsError) {
        setFeaturePromptError({ field: err.detail.field, missing: err.detail.missing });
      } else {
        setError((err as Error).message);
      }
    } finally {
      setFeaturePromptSaving(null);
    }
  };

  const handlePromptConfigChange = async (value: string) => {
    setPromptConfigLoading(true);
    setError(null);
    try {
      const updated = await updatePromptConfig({ default_prompt_id: value });
      setDefaultPromptId(updated.default_prompt_id);
      if (updated.prompt_options?.length) {
        setPromptOptions(updated.prompt_options);
      }
    } catch (err) {
      console.error('Failed to update prompt config', err);
      setError((err as Error).message || t('settings.errors.unableToSaveConfiguration'));
    } finally {
      setPromptConfigLoading(false);
    }
  };

  const handleClearApiKeys = async () => {
    setIsResetting(true);
    try {
      await clearAllApiKeys();

      await refreshApiKeyStatus();
      const llmConfig = await fetchLlmConfig().catch(() => null);
      if (llmConfig) {
        setProvider(llmConfig.provider || 'openai');
        setModel(llmConfig.model || PROVIDER_INFO['openai'].defaultModel);
        setApiBase(llmConfig.api_base || '');
        setReasoningEffort(llmConfig.reasoning_effort ?? 'auto');
      }
      setApiKey('');
      setHasStoredApiKey(false);

      setHealthCheck(null);
      await refreshStatus();
      setError(null);
      setSuccessDialogMessage({
        title: t('common.success'),
        description: t('common.keysCleared'),
      });
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Failed to clear API keys', err);
      setError(t('settings.errors.failedToClearApiKeys'));
    } finally {
      setIsResetting(false);
      setShowClearApiKeysDialog(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      await resetDatabase();

      localStorage.removeItem('master_resume_id');
      localStorage.removeItem('resume_builder_draft');
      localStorage.removeItem('resume_builder_settings');
      localStorage.removeItem('resume_matcher_content_language');
      localStorage.removeItem('resume_matcher_ui_language');

      await refreshStatus();
      setHealthCheck(null);
      setError(null);
      setSuccessDialogMessage({
        title: t('common.success'),
        description: t('common.databaseReset'),
      });
      setShowSuccessDialog(true);
    } catch (err) {
      console.error('Failed to reset database', err);
      setError(t('settings.errors.failedToResetDatabase'));
    } finally {
      setIsResetting(false);
      setShowResetDatabaseDialog(false);
    }
  };

  const formatLastFetched = () => {
    if (!lastFetched) return t('settings.systemStatus.lastFetched.never');
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastFetched.getTime()) / 1000);
    if (diff < 60) return t('settings.systemStatus.lastFetched.justNow');
    if (diff < 3600)
      return t('settings.systemStatus.lastFetched.minutesAgo', { minutes: Math.floor(diff / 60) });
    return t('settings.systemStatus.lastFetched.hoursAgo', { hours: Math.floor(diff / 3600) });
  };

  const requiresApiKey = providerInfo.requiresKey ?? true;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

      <div className="mt-6 space-y-6">
        {/* API Key Not Configured Warning */}
        {!statusLoading && systemStatus && !systemStatus.llm_configured && (
          <Alert
            variant="warning"
            area={t('settings.title')}
            title={t('settings.setupRequired.title')}
          >
            {t('settings.setupRequired.description')}
          </Alert>
        )}

        {/* System Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-steel-grey" />
              <CardTitle className="text-base">{t('settings.systemStatus.title')}</CardTitle>
              {lastFetched && (
                <span className="flex items-center gap-1 text-xs text-steel-grey">
                  <Clock className="h-3 w-3" />
                  {formatLastFetched()}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={refreshStatus} disabled={statusLoading}>
              <RefreshCw className={`h-3.5 w-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
              {t('settings.systemStatus.refresh')}
            </Button>
          </div>

          <div className="mt-4">
            {statusLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-steel-grey" />
              </div>
            ) : !systemStatus ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-red-50/60 p-8">
                <p className="text-sm font-semibold text-red-700">
                  {t('settings.systemStatus.unableToConnect')}
                </p>
                <p className="text-xs text-ink-soft">
                  {t('settings.systemStatus.expectedAt', { apiUrl: API_URL })}
                </p>
                <Button variant="outline" size="sm" onClick={refreshStatus}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t('common.retry')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 @container sm:grid-cols-4">
                <StatCard
                  icon={Server}
                  label={t('settings.statusCards.llm')}
                  value={
                    systemStatus.llm_healthy
                      ? t('settings.statusValues.healthy')
                      : t('settings.statusValues.offline')
                  }
                  ok={systemStatus.llm_healthy}
                />
                <StatCard
                  icon={Database}
                  label={t('settings.statusCards.database')}
                  value={t('settings.statusValues.connected')}
                  ok
                />
                <StatCard
                  icon={FileText}
                  label={t('settings.statusCards.resumes')}
                  value={String(systemStatus.database_stats.total_resumes)}
                />
                <StatCard
                  icon={Briefcase}
                  label={t('settings.statusCards.jobs')}
                  value={String(systemStatus.database_stats.total_jobs)}
                />
                <StatCard
                  icon={Sparkles}
                  label={t('settings.statusCards.improvements')}
                  value={String(systemStatus.database_stats.total_improvements)}
                />
                <StatCard
                  icon={FileText}
                  label={t('settings.statusCards.masterResume')}
                  value={
                    systemStatus.has_master_resume
                      ? t('settings.statusValues.configured')
                      : t('settings.statusValues.notSet')
                  }
                  ok={systemStatus.has_master_resume}
                />
              </div>
            )}
          </div>
        </Card>

        {/* LLM Configuration */}
        <Card>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-steel-grey" />
            <CardTitle className="text-base">{t('settings.llmConfigurationTitle')}</CardTitle>
          </div>

          <div className="mt-4 space-y-5">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>{t('settings.providerLabel')}</Label>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProviderChange(p)}
                    className={`${SEGMENT_BASE} ${provider === p ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
                  >
                    {PROVIDER_INFO[p].name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <p className="text-sm text-steel-grey">
                {t('settings.llmConfiguration.selectedProvider', { provider: providerInfo.name })}
              </p>
            </div>

            {/* Model Input */}
            <div className="space-y-2">
              <Label htmlFor="model">{t('settings.llmConfiguration.modelLabel')}</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={providerInfo.defaultModel}
              />
              <p className="text-sm text-steel-grey">
                {t('settings.llmConfiguration.defaultModel', { model: providerInfo.defaultModel })}
              </p>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                {t('settings.llmConfiguration.apiKeyLabel')}{' '}
                {!requiresApiKey && (
                  <span className="font-normal text-steel-grey">
                    {t('settings.llmConfiguration.apiKeyOptional')}
                  </span>
                )}
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  requiresApiKey
                    ? t('settings.llmConfiguration.apiKeyPlaceholder')
                    : t('settings.llmConfiguration.apiKeyOptionalPlaceholder')
                }
              />
              {hasStoredApiKey && !apiKey && (
                <p className="text-sm text-steel-grey">
                  {t('settings.llmConfiguration.leaveBlankToKeepExistingKey')}
                </p>
              )}
            </div>

            {/* Saved per-provider keys */}
            {apiKeyStatuses.some((s) => s.configured) && (
              <div className="space-y-2 rounded-xl bg-paper-tint/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-steel-grey">
                  {t('settings.apiKeys.savedTitle')}
                </p>
                <ul className="space-y-1.5">
                  {apiKeyStatuses
                    .filter((s) => s.configured)
                    .map((s) => (
                      <li
                        key={s.provider}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium text-ink">
                            {API_KEY_PROVIDER_INFO[s.provider]?.name ?? s.provider}
                          </span>
                          <span className="text-xs text-steel-grey">{s.masked_key}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setKeyToDelete(s.provider)}
                          className="cursor-pointer text-xs font-medium text-destructive hover:underline"
                          aria-label={t('settings.apiKeys.deleteAria', {
                            provider: API_KEY_PROVIDER_INFO[s.provider]?.name ?? s.provider,
                          })}
                        >
                          {t('common.delete')}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Advanced LLM settings — base URL + reasoning effort are rarely
                touched, so they're tucked behind a disclosure. Defaults open
                when either already has a non-default value set. */}
            <Disclosure
              label={t('settings.llmConfiguration.advancedSettingsLabel')}
              defaultOpen={Boolean(apiBase.trim()) || reasoningEffort !== 'auto'}
            >
              <div className="space-y-2">
                <Label htmlFor="apiBase">{t('settings.llmConfiguration.baseUrlLabel')}</Label>
                <Input
                  id="apiBase"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  placeholder={t('settings.llmConfiguration.baseUrlPlaceholder')}
                />
                <p className="text-sm text-steel-grey">
                  {t('settings.llmConfiguration.baseUrlDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Dropdown
                  label={t('settings.llmConfiguration.reasoningEffortLabel')}
                  value={reasoningEffort}
                  onChange={(value) => setReasoningEffort(value as ReasoningEffort | 'auto')}
                  options={[
                    {
                      id: 'auto',
                      label: t('settings.llmConfiguration.reasoningEffortAuto'),
                      description: t('settings.llmConfiguration.reasoningEffortAutoDesc'),
                    },
                    { id: 'minimal', label: t('settings.llmConfiguration.reasoningEffortMinimal') },
                    { id: 'low', label: t('settings.llmConfiguration.reasoningEffortLow') },
                    { id: 'medium', label: t('settings.llmConfiguration.reasoningEffortMedium') },
                    { id: 'high', label: t('settings.llmConfiguration.reasoningEffortHigh') },
                  ]}
                />
                <p className="text-sm text-steel-grey">
                  {t('settings.llmConfiguration.reasoningEffortDescription')}
                </p>
              </div>
            </Disclosure>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={handleSave}
                disabled={status === 'saving' || status === 'loading'}
                className="flex-1"
              >
                {status === 'saving' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === 'saved' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('common.success')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t('common.save')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={status === 'testing' || status === 'saving'}
              >
                {status === 'testing' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    {t('settings.llmConfiguration.testConnection')}
                  </>
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="error" area={t('settings.llmConfigurationTitle')}>
                {t('settings.llmConfiguration.errorPrefix', { error })}
              </Alert>
            )}

            {/* Health Check Result */}
            {healthCheck && (
              <Alert
                variant={healthCheck.healthy ? 'success' : 'error'}
                title={
                  healthCheck.healthy
                    ? t('settings.llmConfiguration.connectionSuccessful')
                    : t('settings.llmConfiguration.connectionFailed')
                }
              >
                <p>
                  {t('settings.llmConfiguration.connectionDetails', {
                    provider: healthCheck.provider,
                    model: healthCheck.model,
                  })}
                </p>
                {healthCheckError && <p className="mt-1 text-red-700">{healthCheckError}</p>}
                {healthCheckWarning && <p className="mt-1 text-amber-700">{healthCheckWarning}</p>}
                {healthDetailItems.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {healthDetailItems.map((item) =>
                      item.key === 'reasoningContent' ? (
                        <details key={item.key} className="group">
                          <summary className="cursor-pointer text-xs font-medium uppercase tracking-wide text-ink-soft hover:text-ink">
                            {item.label}
                          </summary>
                          <pre className="mt-1.5 whitespace-pre-wrap break-words rounded-lg border border-border bg-white p-3 text-xs text-ink-soft">
                            {item.value}
                          </pre>
                        </details>
                      ) : (
                        <div key={item.key}>
                          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                            {item.label}
                          </p>
                          <pre className="mt-1.5 whitespace-pre-wrap break-words rounded-lg border border-border bg-white p-3 text-xs text-ink-soft">
                            {item.value}
                          </pre>
                        </div>
                      )
                    )}
                  </div>
                )}
              </Alert>
            )}
          </div>
        </Card>

        {/* Content Generation */}
        <Card>
          <CardTitle className="text-base">{t('settings.contentGeneration.title')}</CardTitle>
          <p className="mt-1.5 text-sm text-steel-grey">
            {t('settings.contentGeneration.description')}
          </p>

          <div className="mt-4 space-y-3">
            <ToggleSwitch
              checked={enableCoverLetter}
              onCheckedChange={(checked) => {
                setEnableCoverLetter(checked);
                handleFeatureConfigChange('enable_cover_letter', checked);
              }}
              label={t('settings.contentGeneration.coverLetter.label')}
              description={t('settings.contentGeneration.coverLetter.description')}
              disabled={featureConfigLoading}
            />
            {enableCoverLetter && (
              <div className="space-y-2 pl-4">
                <Label htmlFor="coverLetterPrompt">
                  {t('settings.contentGeneration.customPromptLabel')}
                </Label>
                <textarea
                  id="coverLetterPrompt"
                  rows={6}
                  value={coverLetterPrompt}
                  onChange={(e) => setCoverLetterPrompt(e.target.value)}
                  placeholder={coverLetterDefault}
                  className="w-full rounded-lg border border-border bg-white p-3 text-xs text-ink-soft break-words transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 motion-reduce:transition-none"
                />
                <p className="text-sm text-steel-grey">
                  {t('settings.contentGeneration.customPromptHelp')}
                </p>
                {featurePromptError?.field === 'cover_letter_prompt' && (
                  <p className="text-sm text-red-600 break-words">
                    {t('settings.contentGeneration.customPromptErrorMissing', {
                      missing: featurePromptError.missing.join(', '),
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleFeaturePromptSave('cover_letter_prompt', coverLetterPrompt)
                    }
                    disabled={featurePromptSaving === 'cover_letter_prompt'}
                  >
                    {featurePromptSaving === 'cover_letter_prompt' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('common.save')
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeaturePromptSave('cover_letter_prompt', '')}
                    disabled={featurePromptSaving === 'cover_letter_prompt'}
                  >
                    {t('settings.contentGeneration.customPromptResetButton')}
                  </Button>
                </div>
              </div>
            )}

            <ToggleSwitch
              checked={enableOutreach}
              onCheckedChange={(checked) => {
                setEnableOutreach(checked);
                handleFeatureConfigChange('enable_outreach_message', checked);
              }}
              label={t('settings.contentGeneration.outreachMessage.label')}
              description={t('settings.contentGeneration.outreachMessage.description')}
              disabled={featureConfigLoading}
            />
            {enableOutreach && (
              <div className="space-y-2 pl-4">
                <Label htmlFor="outreachPrompt">
                  {t('settings.contentGeneration.customPromptLabel')}
                </Label>
                <textarea
                  id="outreachPrompt"
                  rows={6}
                  value={outreachPrompt}
                  onChange={(e) => setOutreachPrompt(e.target.value)}
                  placeholder={outreachDefault}
                  className="w-full rounded-lg border border-border bg-white p-3 text-xs text-ink-soft break-words transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 motion-reduce:transition-none"
                />
                <p className="text-sm text-steel-grey">
                  {t('settings.contentGeneration.customPromptHelp')}
                </p>
                {featurePromptError?.field === 'outreach_message_prompt' && (
                  <p className="text-sm text-red-600 break-words">
                    {t('settings.contentGeneration.customPromptErrorMissing', {
                      missing: featurePromptError.missing.join(', '),
                    })}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleFeaturePromptSave('outreach_message_prompt', outreachPrompt)
                    }
                    disabled={featurePromptSaving === 'outreach_message_prompt'}
                  >
                    {featurePromptSaving === 'outreach_message_prompt' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('common.save')
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFeaturePromptSave('outreach_message_prompt', '')}
                    disabled={featurePromptSaving === 'outreach_message_prompt'}
                  >
                    {t('settings.contentGeneration.customPromptResetButton')}
                  </Button>
                </div>
              </div>
            )}

            <ToggleSwitch
              checked={enableInterviewPrep}
              onCheckedChange={(checked) => {
                setEnableInterviewPrep(checked);
                handleFeatureConfigChange('enable_interview_prep', checked);
              }}
              label={t('settings.contentGeneration.interviewPrep.label')}
              description={t('settings.contentGeneration.interviewPrep.description')}
              disabled={featureConfigLoading}
            />
          </div>

          <div className="mt-5 border-t border-border pt-5">
            <Dropdown
              options={localizedPromptOptions}
              value={defaultPromptId}
              onChange={handlePromptConfigChange}
              label={t('settings.promptSettings.title')}
              description={t('settings.promptSettings.description')}
              disabled={promptConfigLoading}
            />
          </div>
        </Card>

        {/* Language Settings */}
        <Card>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-steel-grey" />
            <CardTitle className="text-base">
              {t('settings.uiLanguage')} &amp; {t('settings.contentLanguage')}
            </CardTitle>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">{t('settings.uiLanguage')}</h3>
              <p className="mt-0.5 text-sm text-steel-grey">
                {t('settings.uiLanguageDescription')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {supportedLanguages.map((lang) => (
                <button
                  key={`ui-${lang}`}
                  onClick={() => setUiLanguage(lang as Locale)}
                  disabled={languageLoading}
                  className={`${SEGMENT_BASE} ${uiLanguage === lang ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4 border-t border-border pt-5">
            <div>
              <h3 className="text-sm font-semibold text-ink">{t('settings.contentLanguage')}</h3>
              <p className="mt-0.5 text-sm text-steel-grey">
                {t('settings.contentLanguageDescription')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {supportedLanguages.map((lang) => (
                <button
                  key={`content-${lang}`}
                  onClick={() => setContentLanguage(lang as SupportedLanguage)}
                  disabled={languageLoading}
                  className={`${SEGMENT_BASE} ${contentLanguage === lang ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
                >
                  {languageNames[lang]}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Danger Zone — collapsed by default so destructive actions aren't
            the first thing visible on the page. */}
        <Disclosure label={t('settings.dangerZone')} tone="danger">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-xl bg-white p-4">
              <div>
                <h3 className="text-sm font-semibold text-red-900">{t('settings.clearApiKeys')}</h3>
                <p className="mt-0.5 text-sm text-red-700">
                  {t('settings.clearApiKeysDescription')}
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => setShowClearApiKeysDialog(true)}
                disabled={isResetting}
              >
                <Key className="h-4 w-4" />
                {t('settings.clearApiKeys')}
              </Button>
            </div>

            <div className="space-y-3 rounded-xl bg-white p-4">
              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  {t('settings.resetDatabase')}
                </h3>
                <p className="mt-0.5 text-sm text-red-700">
                  {t('settings.resetDatabaseDescription')}
                </p>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowResetDatabaseDialog(true)}
                disabled={isResetting}
              >
                <Trash2 className="h-4 w-4" />
                {t('settings.resetDatabase')}
              </Button>
            </div>
          </div>
        </Disclosure>

        {/* Footer */}
        <div className="flex items-center justify-between rounded-xl bg-paper-tint/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-steel-grey">{getVersionString()}</span>
          </div>
          <div className="flex items-center gap-2">
            {statusLoading ? (
              <Badge variant="neutral" dot>
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('settings.footer.status.checking')}
              </Badge>
            ) : systemStatus ? (
              <Badge variant={systemStatus.status === 'ready' ? 'success' : 'warning'} dot>
                {systemStatus.status === 'ready'
                  ? t('settings.footer.status.ready')
                  : t('settings.footer.status.setupRequired')}
              </Badge>
            ) : (
              <Badge variant="neutral" dot>
                {t('settings.footer.status.offline')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={keyToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setKeyToDelete(null);
        }}
        title={t('settings.apiKeys.deleteConfirmTitle')}
        description={t('settings.apiKeys.deleteConfirmDescription', {
          provider: keyToDelete ? (API_KEY_PROVIDER_INFO[keyToDelete]?.name ?? keyToDelete) : '',
        })}
        confirmLabel={t('common.delete')}
        variant="warning"
        onConfirm={() => {
          if (keyToDelete) void handleDeleteApiKey(keyToDelete);
        }}
      />

      <ConfirmDialog
        open={showClearApiKeysDialog}
        onOpenChange={setShowClearApiKeysDialog}
        title={t('confirmations.clearApiKeys')}
        description={t('confirmations.clearApiKeysDescription')}
        confirmLabel={t('common.delete')}
        variant="warning"
        onConfirm={handleClearApiKeys}
      />

      <ConfirmDialog
        open={showResetDatabaseDialog}
        onOpenChange={setShowResetDatabaseDialog}
        title={t('confirmations.resetDatabase')}
        description={t('confirmations.resetDatabaseDescription')}
        confirmLabel={t('common.reset')}
        variant="danger"
        onConfirm={handleResetDatabase}
      />

      <ConfirmDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        confirmLabel={t('common.close')}
        showCancelButton={false}
        variant="success"
        onConfirm={() => setShowSuccessDialog(false)}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="rounded-xl bg-paper-tint/60 p-3.5">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-steel-grey" />
        <span className="text-xs text-steel-grey">{label}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        {ok !== undefined &&
          (ok ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          ))}
        <span className="text-sm font-semibold text-ink">{value}</span>
      </div>
    </div>
  );
}
