'use client';

import { PersonalRecord } from '@/lib/types/workout';

interface ProfileRecordsProps {
  records: PersonalRecord[];
  isLoading: boolean;
}

export default function ProfileRecords({ records, isLoading }: ProfileRecordsProps) {
  if (isLoading) {
    return <div className="text-center py-8">­¼-...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[color:var(--text-muted)]">~`2LBŠ~[“</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div
          key={record.id}
          className="bg-white rounded-lg border border-[rgba(231,103,76,0.2)] p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{record.exercise_name}</h3>
              <p className="text-[color:var(--text-muted)] text-sm">
                {record.record_type === 'weight' && `${record.weight}kg × ${record.reps}Þ`}
                {record.record_type === 'time' && `${record.duration_seconds}Ò`}
                {record.record_type === 'reps' && `${record.reps}Þ`}
              </p>
            </div>
            <p className="text-xs text-[color:var(--text-subtle)]">
              {new Date(record.achieved_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}