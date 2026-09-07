import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { colors, type } from '../constants/theme';

/** 마감까지 남은 시간을 초 단위로 갱신해 보여준다. */
export default function Countdown({ minutes, style, prefix = '', suffix = ' 남음', urgentUnder = 60 }) {
  const target = useRef(Date.now() + minutes * 60 * 1000).current;
  const [left, setLeft] = useState(minutes * 60);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.round((target - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [target]);

  if (left <= 0) {
    return <Text style={[type.tiny, { color: colors.textFaint }, style]}>마감</Text>;
  }

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const sec = left % 60;
  const urgent = left < urgentUnder * 60;
  const text = h > 0 ? `${h}시간 ${m}분` : m > 0 ? `${m}분 ${String(sec).padStart(2, '0')}초` : `${sec}초`;

  return (
    <Text
      style={[type.tiny, { color: urgent ? colors.close : colors.textFaint, fontVariant: ['tabular-nums'] }, style]}
      accessibilityLabel={`마감까지 ${text}`}
    >
      {prefix}
      {text}
      {suffix}
    </Text>
  );
}
