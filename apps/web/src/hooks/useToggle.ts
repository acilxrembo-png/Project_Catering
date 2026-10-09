import { useState, useCallback } from 'react';

const useToggle = (nilaiAwal = false): [boolean, () => void, (nilai: boolean) => void] => {
  const [nilai, setNilai] = useState(nilaiAwal);
  const toggle = useCallback(() => setNilai((prev) => !prev), []);
  return [nilai, toggle, setNilai];
};

export default useToggle;
