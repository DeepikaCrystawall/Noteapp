const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

const NOTE_PERMISSION_HIERARCHY = {
  owner: 3,
  write: 2,
  read: 1,
};

export const hasTeamRole = (userRole, requiredRole) => {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
};

export const hasNotePermission = (userPermission, requiredPermission) => {
  return (NOTE_PERMISSION_HIERARCHY[userPermission] || 0) >= (NOTE_PERMISSION_HIERARCHY[requiredPermission] || 0);
};

export const canManageTeam = (role) => hasTeamRole(role, 'admin');
export const canEditNotes = (role) => hasTeamRole(role, 'editor');
export const canViewNotes = (role) => hasTeamRole(role, 'viewer');
export const canWriteNote = (permission) => hasNotePermission(permission, 'write');
export const canReadNote = (permission) => hasNotePermission(permission, 'read');

export const TEAM_ROLES = Object.keys(ROLE_HIERARCHY);
export const NOTE_PERMISSIONS = Object.keys(NOTE_PERMISSION_HIERARCHY);
