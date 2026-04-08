import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { isFirebaseConfigured, onAuth, syncProfilesUp, syncProfilesDown } from '@/lib/firebase';

// Auto-sync hook: subscribes to auth state and pushes profile changes to Firestore.
// - On sign-in: pulls cloud data once and merges by updatedAt
// - On any profile change: debounced upsert to cloud
export function useCloudSync() {
  const setCloudUser = useStore((s) => s.setCloudUser);
  const applyCloudData = useStore((s) => s.applyCloudData);
  const cloudUid = useStore((s) => s.cloudUid);
  const profiles = useStore((s) => s.profiles);
  const activeProfileId = useStore((s) => s.activeProfileId);
  const debounceRef = useRef<number | null>(null);
  const initialPullDone = useRef(false);

  // Auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = onAuth(async (user) => {
      if (user) {
        setCloudUser(user.uid, user.email);
        if (!initialPullDone.current) {
          initialPullDone.current = true;
          const cloud = await syncProfilesDown(user.uid);
          if (cloud && Array.isArray(cloud.profiles) && cloud.profiles.length > 0) {
            const localUpdated = useStore.getState().lastSyncAt;
            // Cloud wins if it's newer or local has never synced
            if ((cloud.updatedAt || 0) >= localUpdated) {
              applyCloudData(cloud.profiles as any, cloud.activeProfileId, cloud.updatedAt);
            } else {
              // Local is newer — push it up
              await syncProfilesUp(user.uid, {
                profiles: useStore.getState().profiles,
                activeProfileId: useStore.getState().activeProfileId,
                updatedAt: Date.now(),
              });
            }
          }
        }
      } else {
        setCloudUser(null, null);
        initialPullDone.current = false;
      }
    });
    return unsub;
  }, []);

  // Push profile changes (debounced 2s)
  useEffect(() => {
    if (!cloudUid || !initialPullDone.current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      syncProfilesUp(cloudUid, {
        profiles,
        activeProfileId,
        updatedAt: Date.now(),
      });
    }, 2000);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [cloudUid, profiles, activeProfileId]);
}
