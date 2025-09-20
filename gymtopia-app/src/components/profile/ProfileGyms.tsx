'use client';

import { FavoriteGym } from '@/lib/types/profile';
import { FrequentGym } from '@/lib/supabase/profile';

interface ProfileGymsProps {
  favoriteGyms: FavoriteGym[];
  frequentGyms: FrequentGym[];
  isLoading: boolean;
}

export default function ProfileGyms({
  favoriteGyms,
  frequentGyms,
  isLoading
}: ProfileGymsProps) {
  if (isLoading) {
    return <div className="text-center py-8">≠º-...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Jkeä∏‡ */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Jkeä∏‡</h3>
        {favoriteGyms.length === 0 ? (
          <p className="text-[color:var(--text-muted)]">
            Jkeä∏‡LBä~[ì
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteGyms.map((fav) => fav.gym && (
              <div
                key={fav.id}
                className="bg-white rounded-lg border border-[rgba(231,103,76,0.2)] p-4"
              >
                <h4 className="font-semibold">{fav.gym.name}</h4>
                {fav.gym.area && (
                  <p className="text-sm text-[color:var(--text-muted)]">
                    {fav.gym.area}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* àOLO∏‡ */}
      <div>
        <h3 className="text-lg font-semibold mb-3">àOLO∏‡</h3>
        {frequentGyms.length === 0 ? (
          <p className="text-[color:var(--text-muted)]">
            ~`∏‡;’n2LBä~[ì
          </p>
        ) : (
          <div className="space-y-3">
            {frequentGyms.map((gym) => (
              <div
                key={gym.id}
                className="bg-white rounded-lg border border-[rgba(231,103,76,0.2)] p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{gym.name}</h4>
                    {gym.city && (
                      <p className="text-sm text-[color:var(--text-muted)]">
                        {gym.prefecture} {gym.city}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[color:var(--gt-primary)]">
                      {gym.visit_count}
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)]">ﬁ*O</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}