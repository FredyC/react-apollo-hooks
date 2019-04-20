import { act } from 'react-testing-library';

export default function wait(ms: number = 10): Promise<void> {
  return new Promise(resolve => {
    act(() => {
      setTimeout(resolve, ms);
    });
  });
}
