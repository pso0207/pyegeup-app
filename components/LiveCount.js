import React, { useEffect, useRef, useState } from 'react';
import { Text, Animated } from 'react-native';
import { colors} from '../constants/theme';

/**
 * LIVE 배지 옆에 멈춰 있는 숫자는 거짓말처럼 보인다.
 * 실제 투표가 들어오는 것처럼 불규칙한 간격으로 올리고, 오를 때만 잠깐 밝아진다.
 * 서버가 붙으면 setInterval 자리를 소켓 수신으로 바꾸면 된다.
 */
export default function LiveCount({ from = 0, step = () => 1 + Math.floor(Math.random() * 3), everyMs = 3200, style, suffix = '' }) {
  const [n, setN] = useState(from);
  const flash = useRef(new Animated.Value(0)).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timer;
    const tick = () => {
      if (!mounted.current) return;
      setN((v) => v + step());
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 140, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 600, useNativeDriver: false }),
      ]).start();
      // 일정한 간격은 기계처럼 보인다. ±40%로 흔든다.
      timer = setTimeout(tick, everyMs * (0.6 + Math.random() * 0.8));
    };
    timer = setTimeout(tick, everyMs);
    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, [everyMs]);

  return (
    <Animated.Text
      accessibilityLiveRegion="polite"
      style={[
        style,
        { color: flash.interpolate({ inputRange: [0, 1], outputRange: [style?.color ?? colors.textMuted, colors.accent] }) },
      ]}
    >
      {n.toLocaleString()}
      {suffix}
    </Animated.Text>
  );
}
