import teamService from '../services/team.service.js';
import { successResponse } from '../utils/response.js';

class TeamController {
  async create(req, res, next) {
    try {
      const team = await teamService.createTeam(req.user.id, req.body);
      successResponse(res, team, 'Team created', 201);
    } catch (error) {
      next(error);
    }
  }

  async list(req, res, next) {
    try {
      const teams = await teamService.getTeams(req.user.id);
      successResponse(res, teams);
    } catch (error) {
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const team = await teamService.getTeam(req.params.teamId, req.user.id);
      successResponse(res, team);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const team = await teamService.updateTeam(req.params.teamId, req.user.id, req.body);
      successResponse(res, team, 'Team updated');
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await teamService.deleteTeam(req.params.teamId, req.user.id);
      successResponse(res, null, 'Team deleted');
    } catch (error) {
      next(error);
    }
  }

  async invite(req, res, next) {
    try {
      const member = await teamService.inviteMember(req.params.teamId, req.user.id, req.body);
      successResponse(res, member, 'Member invited', 201);
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      await teamService.removeMember(req.params.teamId, req.user.id, req.params.memberId);
      successResponse(res, null, 'Member removed');
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const member = await teamService.updateMemberRole(
        req.params.teamId,
        req.user.id,
        req.params.memberId,
        req.body.role
      );
      successResponse(res, member, 'Role updated');
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamController();
