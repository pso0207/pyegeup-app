import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useApp } from '../store/useApp';

/**
 * 당겨서 새로고침 공용 훅. 목업이라 실제로 받아올 것이 없어 지연만 두지만,
 * 서버를 붙일 때 refetch만 갈아끼우면 되도록 화면 쪽 코드를 한 줄로 유지한다.
 */
export default function useRefresh(message = '새로 불러왔습니다', refetch) {
  const [refreshing, setRefreshing] = useState(false);
  const showToast = useApp((s) => s.showToast);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Promise.resolve(refetch?.()).then(() => {
      setTimeout(() => {
        setRefreshing(false);
        showToast(message, 'ok');
      }, 800);
    });
  }, [message, refetch, showToast]);

  return { refreshing, onRefresh };
}
