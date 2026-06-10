import { models } from '../config/database.js';
import { toPlain } from '../utils/modelHelper.js';

const { Team, TeamMember, User } = models;

class TeamRepository {
  async findById(id) {
    const team = await Team.findOne({
      where: { id },
      include: [{ model: User, as: 'owner', attributes: ['name'] }],
    });
    if (!team) return null;
    const plain = toPlain(team);
    plain.owner_name = team.owner?.name;
    return plain;
  }

  async findBySlug(slug) {
    const team = await Team.findOne({ where: { slug } });
    return toPlain(team);
  }

  async findByUserId(userId) {
    const teams = await Team.findAll({
      include: [{
        model: TeamMember,
        as: 'teamMembers',
        where: { user_id: userId },
        attributes: ['role'],
      }],
      order: [['name', 'ASC']],
    });
    return teams.map((team) => {
      const plain = toPlain(team);
      plain.member_role = team.teamMembers?.[0]?.role;
      delete plain.teamMembers;
      return plain;
    });
  }

  async create({ name, description, slug, ownerId }) {
    const team = await Team.create({
      name,
      description,
      slug,
      owner_id: ownerId,
    });
    return toPlain(team);
  }

  async update(id, data) {
    const team = await Team.findByPk(id);
    if (!team) return null;
    await team.update(data);
    return toPlain(team);
  }

  async softDelete(id) {
    await Team.destroy({ where: { id } });
  }

  async getMembers(teamId) {
    const members = await TeamMember.findAll({
      where: { team_id: teamId },
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'avatar_url'] }],
      order: [['role', 'DESC']],
    });
    return members.map((m) => ({
      ...toPlain(m),
      name: m.user?.name,
      email: m.user?.email,
      avatar_url: m.user?.avatar_url,
    }));
  }

  async addMember({ teamId, userId, role, invitedBy }) {
    let member = await TeamMember.findOne({
      where: { team_id: teamId, user_id: userId },
      paranoid: false,
    });

    if (member) {
      if (member.deleted_at) await member.restore();
      await member.update({ role, invited_by: invitedBy, invited_at: new Date() });
    } else {
      member = await TeamMember.create({
        team_id: teamId,
        user_id: userId,
        role,
        invited_by: invitedBy,
        invited_at: new Date(),
      });
    }
    return toPlain(member);
  }

  async getMember(teamId, userId) {
    const member = await TeamMember.findOne({ where: { team_id: teamId, user_id: userId } });
    return toPlain(member);
  }

  async updateMemberRole(teamId, userId, role) {
    const member = await TeamMember.findOne({ where: { team_id: teamId, user_id: userId } });
    if (!member) return null;
    await member.update({ role });
    return toPlain(member);
  }

  async removeMember(teamId, userId) {
    await TeamMember.destroy({ where: { team_id: teamId, user_id: userId } });
  }
}

export default new TeamRepository();
