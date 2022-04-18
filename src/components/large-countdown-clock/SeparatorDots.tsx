import React from 'react';
import { Box } from '@rainbow-me/design-system';

type SeparatorDotsProps = {
  minuteEndsWithOne: boolean;
  size: number;
};

export function SeparatorDots({ size, minuteEndsWithOne }: SeparatorDotsProps) {
  return (
    <Box
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      paddingBottom={{ custom: 2 }}
      paddingLeft={{ custom: minuteEndsWithOne ? 0 : 3 }}
      paddingRight={{ custom: 3 }}
      style={{
        marginLeft: minuteEndsWithOne ? -1 : 0,
      }}
    >
      <Box
        borderRadius={200}
        height={{ custom: size }}
        marginBottom={{ custom: size / 2 }}
        marginTop={{ custom: size / 2 }}
        style={{
          backgroundColor: '#9875D7',
        }}
        width={{ custom: size }}
      />
      <Box
        borderRadius={200}
        height={{ custom: size }}
        marginBottom={{ custom: size / 2 }}
        marginTop={{ custom: size / 2 }}
        style={{
          backgroundColor: '#9875D7',
        }}
        width={{ custom: size }}
      />
    </Box>
  );
}