// utils/generateRoomId.ts
export const generateRoomId = (
  type: 'admin' | 'direct',
  id1: string,
  id2: string
): string => {
  const sorted = [id1, id2].sort();
  return `${type}-chat-${sorted[0]}-${sorted[1]}`;
};
