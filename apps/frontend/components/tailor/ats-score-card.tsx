'use client';

import type { ATSScore } from '@/components/common/resume_previewer_context';
import { Card, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { MatchScoreRing } from '@/components/ui/match-score-ring';
import { Badge } from '@/components/ui/badge';
import Lightbulb from 'lucide-react/dist/esm/icons/lightbulb';

interface ATSScoreCardProps {
  atsScore: ATSScore;
}

const SUB_SCORE_LABELS: Record<string, string> = {
  keyword_match: 'Keyword Match',
  skills_coverage: 'Skills Coverage',
  section_completeness: 'Section Completeness',
};

export function ATSScoreCard({ atsScore }: ATSScoreCardProps) {
  const { overall_score, sub_scores, missing_keywords, injectable_keywords, recommendations } =
    atsScore;

  return (
    <Card>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <MatchScoreRing value={overall_score} size={104} />
        <div className="flex-1">
          <CardTitle className="text-base">Match score breakdown</CardTitle>
          <p className="mt-1 text-sm text-steel-grey">
            How well your tailored resume lines up with this job description.
          </p>
        </div>
      </div>

      {/* Sub-score breakdown */}
      <div className="mt-6 space-y-4">
        {Object.entries(sub_scores).map(([key, value]) => (
          <ProgressBar key={key} label={SUB_SCORE_LABELS[key] ?? key} value={value} size="sm" />
        ))}
      </div>

      {/* Missing keywords (risks) */}
      {missing_keywords.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-semibold text-ink">Missing keywords</p>
          <p className="mt-0.5 text-sm text-steel-grey">
            These appear in the job description but not in your resume.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {missing_keywords.map((kw, i) => (
              <Badge key={`missing-${i}-${kw}`} variant="danger">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Injectable keywords (strengths already available) */}
      {injectable_keywords.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-semibold text-ink">Safe to add</p>
          <p className="mt-0.5 text-sm text-steel-grey">
            Already in your master resume — worth working into this version.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {injectable_keywords.map((kw, i) => (
              <Badge key={`injectable-${i}-${kw}`} variant="primary">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-semibold text-ink">Recommendations</p>
          <ul className="mt-3 space-y-2.5">
            {recommendations.map((tip, i) => (
              <li
                key={`rec-${i}-${tip.slice(0, 30)}`}
                className="flex gap-2.5 text-sm text-ink-soft"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
