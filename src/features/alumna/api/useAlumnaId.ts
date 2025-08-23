import { useSearchParams } from 'react-router-dom';

export function useAlumnaId() {
  const [sp] = useSearchParams();
  const fromQS = sp.get('cliente'); // permite /alumna?cliente=123
  const fromEnv = import.meta.env.VITE_CLIENTE_ID as string | undefined;
  return fromQS ?? fromEnv ?? '1';
}
