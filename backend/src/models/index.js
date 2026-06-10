import defineUser from './User.js';
import defineTeam from './Team.js';
import defineTeamMember from './TeamMember.js';
import defineNote from './Note.js';
import defineNotePermission from './NotePermission.js';
import defineNoteVersion from './NoteVersion.js';
import defineTag from './Tag.js';
import defineNoteTag from './NoteTag.js';
import defineNotification from './Notification.js';
import defineActivityLog from './ActivityLog.js';
import defineRefreshToken from './RefreshToken.js';

export default function initModels(sequelize) {
  const User = defineUser(sequelize);
  const Team = defineTeam(sequelize);
  const TeamMember = defineTeamMember(sequelize);
  const Note = defineNote(sequelize);
  const NotePermission = defineNotePermission(sequelize);
  const NoteVersion = defineNoteVersion(sequelize);
  const Tag = defineTag(sequelize);
  const NoteTag = defineNoteTag(sequelize);
  const Notification = defineNotification(sequelize);
  const ActivityLog = defineActivityLog(sequelize);
  const RefreshToken = defineRefreshToken(sequelize);

  User.hasMany(Team, { foreignKey: 'owner_id', as: 'ownedTeams' });
  Team.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

  Team.belongsToMany(User, { through: TeamMember, foreignKey: 'team_id', otherKey: 'user_id', as: 'members' });
  User.belongsToMany(Team, { through: TeamMember, foreignKey: 'user_id', otherKey: 'team_id', as: 'teams' });
  Team.hasMany(TeamMember, { foreignKey: 'team_id', as: 'teamMembers' });
  TeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  TeamMember.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  User.hasMany(Note, { foreignKey: 'owner_id', as: 'notes' });
  Note.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
  Team.hasMany(Note, { foreignKey: 'team_id', as: 'notes' });
  Note.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  Note.hasMany(NotePermission, { foreignKey: 'note_id', as: 'permissions' });
  NotePermission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  NotePermission.belongsTo(Note, { foreignKey: 'note_id', as: 'note' });

  Note.hasMany(NoteVersion, { foreignKey: 'note_id', as: 'versions' });
  NoteVersion.belongsTo(User, { foreignKey: 'created_by', as: 'author' });

  User.hasMany(Tag, { foreignKey: 'user_id', as: 'tags' });
  Tag.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Tag.belongsTo(Team, { foreignKey: 'team_id', as: 'team' });

  Note.belongsToMany(Tag, { through: NoteTag, foreignKey: 'note_id', otherKey: 'tag_id', as: 'tags' });
  Tag.belongsToMany(Note, { through: NoteTag, foreignKey: 'tag_id', otherKey: 'note_id', as: 'notes' });
  NoteTag.belongsTo(Note, { foreignKey: 'note_id', as: 'note' });
  NoteTag.belongsTo(Tag, { foreignKey: 'tag_id', as: 'tag' });

  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
  ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
  RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  return {
    User,
    Team,
    TeamMember,
    Note,
    NotePermission,
    NoteVersion,
    Tag,
    NoteTag,
    Notification,
    ActivityLog,
    RefreshToken,
  };
}
