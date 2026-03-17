import { useCallback } from 'react';
import { useNotification } from '@/context/NotificationContext';

const DEMO_MESSAGE = 'Esta é uma demonstração. Operações de escrita não estão disponíveis.';

export function useDemoGuard() {
  const { addNotification } = useNotification();
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const guard = useCallback(
    async (action: () => Promise<void>): Promise<void> => {
      if (isDemo) {
        addNotification(DEMO_MESSAGE, 'warning');
        return;
      }
      await action();
    },
    [isDemo, addNotification]
  );

  return guard;
}
