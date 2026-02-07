import { TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTheme } from '../../theme/ThemeContext';

export interface SheetRef {
  present: () => void;
  dismiss: () => void;
}

interface SheetProps extends Omit<TrueSheetProps, 'ref'> {
  children: React.ReactNode;
  sizes?: (string | number)[];
  grabberHeader?: boolean;
}

export const Sheet = forwardRef<SheetRef, SheetProps>(({ children, ...props }, ref) => {
  const { colors } = useTheme();
  const sheetRef = useRef<TrueSheet>(null);

  useImperativeHandle(ref, () => ({
    present: () => sheetRef.current?.present(),
    dismiss: () => sheetRef.current?.dismiss(),
  }));

  return (
    <TrueSheet
      ref={sheetRef}
      backgroundColor={colors.bgSurface}
      cornerRadius={24}
      {...props}
    >
      {children}
    </TrueSheet>
  );
});

Sheet.displayName = 'Sheet';
