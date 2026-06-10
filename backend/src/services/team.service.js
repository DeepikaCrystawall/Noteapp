import teamRepository from '../repositories/team.repository.js';
import userRepository from '../repositories/user.repository.js';
import activityLogRepository from '../repositories/activityLog.repository.js';
import notificationService from './notification.service.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../utils/errors.js';
import { hasTeamRole } from '../utils/permissions.js';

class TeamService {
  async createTeam(userId, { name, description }) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await teamRepository.findBySlug(slug);
    if (existing) throw new ConflictError('Team with similar name already exists');

    const team = await teamRepository.create({ name, description, slug, ownerId: userId });
    await teamRepository.addMember({ teamId: team.id, userId, role: 'owner', invitedBy: userId });

    await activityLogRepository.create({
      userId,
      action: 'team_created',
      entityType: 'team',
      entityId: team.id,
      metadata: { name },
    });

    return team;
  }

  async getTeams(userId) {
    return teamRepository.findByUserId(userId);
  }

  async getTeam(teamId, userId) {
    const team = await teamRepository.findById(teamId);
    if (!team) throw new NotFoundError('Team not found');

    const member = await teamRepository.getMember(teamId, userId);
    if (!member) throw new ForbiddenError('Not a team member');

    const members = await teamRepository.getMembers(teamId);
    return { ...team, members, currentUserRole: member.role };
  }

  async updateTeam(teamId, userId, data) {
    await this._requireRole(teamId, userId, 'admin');
    const team = await teamRepository.update(teamId, data);
    if (!team) throw new NotFoundError('Team not found');

    await activityLogRepository.create({
      userId,
      action: 'team_updated',
      entityType: 'team',
      entityId: teamId,
      metadata: data,
    });

    return team;
  }

  async deleteTeam(teamId, userId) {
    await this._requireRole(teamId, userId, 'owner');
    await teamRepository.softDelete(teamId);

    await activityLogRepository.create({
      userId,
      action: 'team_deleted',
      entityType: 'team',
      entityId: teamId,
      metadata: {},
    });
  }

  async inviteMember(teamId, userId, { email, role }) {
    await this._requireRole(teamId, userId, 'admin');

    const invitee = await userRepository.findByEmail(email);
    if (!invitee) throw new NotFoundError('User not found with this email');

    const existing = await teamRepository.getMember(teamId, invitee.id);
    if (existing) throw new ConflictError('User is already a team member');

    const member = await teamRepository.addMember({
      teamId,
      userId: invitee.id,
      role,
      invitedBy: userId,
    });

    const team = await teamRepository.findById(teamId);

    await notificationService.create({
      userId: invitee.id,
      type: 'team_invite',
      title: 'Team Invitation',
      message: `You have been invited to join ${team.name}`,
      data: { teamId, role },
    });

    await activityLogRepository.create({
      userId,
      action: 'user_invited',
      entityType: 'team',
      entityId: teamId,
      metadata: { inviteeId: invitee.id, role },
    });

    return member;
  }

  async removeMember(teamId, userId, memberId) {
    await this._requireRole(teamId, userId, 'admin');

    const targetMember = await teamRepository.getMember(teamId, memberId);
    if (!targetMember) throw new NotFoundError('Member not found');
    if (targetMember.role === 'owner') throw new ForbiddenError('Cannot remove team owner');

    await teamRepository.removeMember(teamId, memberId);

    await activityLogRepository.create({
      userId,
      action: 'member_removed',
      entityType: 'team',
      entityId: teamId,
      metadata: { memberId },
    });
  }

  async updateMemberRole(teamId, userId, memberId, role) {
    await this._requireRole(teamId, userId, 'owner');

    if (role === 'owner') {
      await teamRepository.updateMemberRole(teamId, userId, 'admin');
    }

    const member = await teamRepository.updateMemberRole(teamId, memberId, role);
    if (!member) throw new NotFoundError('Member not found');

    await activityLogRepository.create({
      userId,
      action: 'role_changed',
      entityType: 'team',
      entityId: teamId,
      metadata: { memberId, role },
    });

    return member;
  }

  async _requireRole(teamId, userId, requiredRole) {
    const member = await teamRepository.getMember(teamId, userId);
    if (!member) throw new ForbiddenError('Not a team member');
    if (!hasTeamRole(member.role, requiredRole)) {
      throw new ForbiddenError(`Requires ${requiredRole} role or higher`);
    }
    return member;
  }
}

export default new TeamService();
