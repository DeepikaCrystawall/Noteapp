export function canWriteNote(userPermission) {
  return userPermission === 'owner' || userPermission === 'write';
}

export function canReadNote(userPermission) {
  return canWriteNote(userPermission) || userPermission === 'read';
}
